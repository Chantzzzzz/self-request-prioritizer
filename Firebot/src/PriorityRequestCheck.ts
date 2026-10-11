import { RunRequest, Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";
import { BeatSaverSongData } from "../types/types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

const msPerDay = 86400000;

type Params = {
  priotitizeRaidRequests: boolean
  raidRequestSongMessage?: string

  prioritizeSelfRequests: boolean
  selfRequestMaxMapAgeDays?: number
  selfRequestLimitPerUser?: number
  selfRequestSongMessage?: string

  sendChatAs: "Streamer" | "Bot"
  fallBackToStreamer: boolean
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Self Request Prioritizer",
      description: "If a map author requests their own map, bump it to the top of the queue",
      author: "Chantzzzzz",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      priotitizeRaidRequests: {
        type: "boolean",
        default: true,
        description: "Enables an automatic !mtt command for a user who raids your channel",
        title: "Enable Priority Raid Requests"
      },
      raidRequestSongMessage: {
        type: "string",
        default: "Raid request from <raider_username>",
        description: "Optionally set a message on a prioritized raid request. If empty, skips adding a message. If you want to have the raider's username in the request, use the string <raider_username> and it will get replaced with the username when set.",
        title: "Raid Request Message",
        showBottomHr: true
      },

      prioritizeSelfRequests: {
        type: "boolean",
        default: true,
        description: "Enables an automatic !mtt command to bump requests that come from a map creator",
        title: "Enable Priority Self-Requests"
      },
      selfRequestMaxMapAgeDays: {
        type: "number",
        default: 14,
        description: "The max age (in days) a map can be to be prioritized. Set to 0 to allow any self-request.",
        title: "Max Self-Request Map Age (days)"
      },
      selfRequestLimitPerUser: {
        type: "number",
        default: 1,
        description: "How many times per stream a user can get their own map requests prioritized. Set to 0 to allow any number of self-requests.",
        title: "Max Self-Requests Per Stream"
      },
      selfRequestSongMessage: {
        type: "string",
        default: "Map author self-request",
        description: "Optionally set a message on a prioritized self-request. If empty, skips adding a message.",
        title: "Self-Request Message",
        showBottomHr: true
      },

      sendChatAs: {
        type: "enum",
        default: "Streamer",
        description: "Which account to send chat commands from",
        title: "Chat Account",
        options: ["Streamer", "Bot"]
      },
      fallBackToStreamer: {
        type: "boolean",
        default: true,
        description: "If you select to send messages from your bot account, but it isn't configured, whether to use the streamer account instead",
        title: "Fall Back To Streamer Account"
      }
    };
  },
  run: (runRequest: RunRequest<Params>) => {

    const { logger, customVariableManager } = runRequest.modules;

    // Check for valid chat configuration =========================================================
    // ============================================================================================

    const FALLBACK_TO_STREAMER = runRequest.parameters.fallBackToStreamer;
    let CHAT_AS = runRequest.parameters.sendChatAs;

    if (CHAT_AS === "Bot" && !runRequest.firebot.accounts.bot.loggedIn) {

      if (FALLBACK_TO_STREAMER) {

        CHAT_AS = "Streamer";

      } else {

        logger.error(`Author Self-Request Check is configured to chat as Bot account with no fallback, but bot is not logged in!`);

        return Promise.resolve({
          success: false,
          errorMessage: `Author Self-Request Check is configured to chat as Bot account with no fallback, but bot is not logged in!`,
          effects: []
        });

      }

    }

    // Check for a valid BSR code =================================================================
    // ============================================================================================

    const songCode = runRequest.trigger.metadata.userCommand?.args?.[0];

    // If the command got triggered with no song code or an invalid code, skip execution
    if (typeof songCode !== 'string' || !/^[0-9a-f]{1,5}$/i.test(songCode)) {

      logger.warn(`Invalid song code ${songCode} - skipping self-request check`);

      return {
        success: true,
        errorMessage: '',
        effects: []
      } as ScriptReturnObject;

    }

    // Twitch requester username
    const requesterParam = runRequest.trigger.metadata.username;

    // Normalize username to lowercase remove any potential @ symbols
    const requester = requesterParam.startsWith('@') ? requesterParam.toLowerCase().slice(1) : requesterParam.toLowerCase();

    logger.debug(`Checking song request ${songCode} from ${requester} for author self-request...`);

    // Perform raid request check, if enabled =====================================================
    // ============================================================================================

    const PRIORITIZE_RAID_REQUESTS = runRequest.parameters.priotitizeRaidRequests;

    if (PRIORITIZE_RAID_REQUESTS) {

      logger.debug(`==================== Raid Request Check ====================`);

      const RAID_REQUEST_SONG_MESSAGE = runRequest.parameters.raidRequestSongMessage;

      // Check if we've granted a raid rquest to this user
      const hasRaidRequest = customVariableManager.getCustomVariable(`hasRaidRequest_${requester}`) ?? false;

      if (hasRaidRequest) {

        // Unset the hasRaidRequest variable for the user
        customVariableManager.addCustomVariable(`hasRaidRequest_${requester}`, false);

        const effects: Effects.Effect[] = [{
          type: 'firebot:chat',
          message: `!mtt ${songCode}`,
          chatter: CHAT_AS
        }];

        if (typeof RAID_REQUEST_SONG_MESSAGE === 'string' && RAID_REQUEST_SONG_MESSAGE !== '') {

          effects.push({
            type: 'firebot:chat',
            message: `!songmsg ${songCode} ${RAID_REQUEST_SONG_MESSAGE.replace('<raider_username>', requester)}`,
            chatter: CHAT_AS
          });

        }

        return {
          success: true,
          errorMessage: 'None',
          effects: effects
        } as ScriptReturnObject;

      }

    }

    // Perform self-request check, if enabled =====================================================
    // ============================================================================================

    const PRIORITIZE_SELF_REQUESTS = runRequest.parameters.priotitizeSelfRequests;

    if (PRIORITIZE_SELF_REQUESTS) {

      logger.debug(`==================== Author Self-Request Check ====================`);

      const MAX_SELF_REQUESTS_PER_STREAM = runRequest.parameters.selfRequestLimitPerUser;
      const MAX_MAP_AGE_DAYS = runRequest.parameters.selfRequestMaxMapAgeDays;
      const SELF_REQUEST_SONG_MESSAGE = runRequest.parameters.selfRequestSongMessage;

      return new Promise<ScriptReturnObject>((resolve) => {

        const selfRequestCount = customVariableManager.getCustomVariable(`selfRequestCount_${requester}`) || 0;

        if (MAX_SELF_REQUESTS_PER_STREAM > 0 && selfRequestCount >= MAX_SELF_REQUESTS_PER_STREAM) {

          logger.debug(`Requester ${requester} has already had ${selfRequestCount} self-requests prioritized (maximum per stream is ${MAX_SELF_REQUESTS_PER_STREAM}). Skipping request.`);

          return resolve({
            success: true,
            errorMessage: '',
            effects: []
          } as ScriptReturnObject);

        }

        fetch(`https://api.beatsaver.com/maps/id/${songCode}`).then((response) => {

          return response.json();

        }).then((jsonData: BeatSaverSongData) => {

          if (MAX_MAP_AGE_DAYS > 0) {

            const daysSinceLastPublished = (Date.now() - new Date(jsonData.lastPublishedAt).getTime()) / msPerDay;

            if (daysSinceLastPublished > MAX_MAP_AGE_DAYS) {

              logger.debug(`Song ${songCode} was last published ${daysSinceLastPublished.toFixed(1)} days ago which is greater than max allowable age of ${MAX_MAP_AGE_DAYS} days ago`);

              return resolve({
                success: true,
                errorMessage: '',
                effects: []
              } as ScriptReturnObject);

            }

          }

          const requesterAliases = [requester] as string[];

          // assumed to be normalized into lowercase already
          const otherAliases = customVariableManager.getCustomVariable('authorLookupDictionary', requester) as string[];

          if (Array.isArray(otherAliases)) {
            requesterAliases.push(...otherAliases);
          }

          const authorNames = [jsonData?.uploader?.name.toLowerCase()];

          jsonData?.collaborators?.forEach((collaborator) => {
            authorNames.push(collaborator?.name.toLowerCase());
          });

          const isSelfRequest = authorNames.some((authorName) => requesterAliases.indexOf(authorName) > -1);

          if (!isSelfRequest) {

            logger.debug(`Map ${songCode} requested by known author ${requester} but it doesn't look like they're an author on this map`);

            return resolve({
              success: true,
              errorMessage: '',
              effects: []
            } as ScriptReturnObject);

          }

          customVariableManager.addCustomVariable(`selfRequestCount_${requester}`, selfRequestCount + 1);

          const effects: Effects.Effect[] = [{
            type: 'firebot:chat',
            message: `!mtt ${songCode}`,
            chatter: CHAT_AS
          }];

          if (SELF_REQUEST_SONG_MESSAGE) {

            effects.push({
              type: 'firebot:chat',
              message: `!songmsg ${songCode} ${SELF_REQUEST_SONG_MESSAGE}`,
              chatter: CHAT_AS
            });

          }

          resolve({
            success: true,
            errorMessage: 'None',
            effects: effects
          } as ScriptReturnObject);

        }).catch((e) => {

          logger.warn(`Failed to check song ${songCode} for self-request by ${requester}: ${e}`);

          resolve({
            success: false,
            errorMessage: `Failed to check song ${songCode} for self-request by ${requester}: ${e}`,
            effects: []
          } as ScriptReturnObject);

        });

      });

    }

  },

};

export default script;
