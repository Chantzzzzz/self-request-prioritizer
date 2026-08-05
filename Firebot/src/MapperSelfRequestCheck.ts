import { RunRequest, Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";
import { BeatSaverSongData, MapperLookupDictionary } from "../types/types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";

const msPerDay = 86400000;

type Params = {
  selfRequestMaxMapAgeDays: number
  selfRequestLimitPerUser: number
  selfRequestSongMessage: string
  selfRequestCheckTrigger: "!bsr"|"! bsradd"
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Self Request Prioritizer",
      description: "If a map author requests their own map, bump it to the top of the queue",
      author: "Chantzzzzz",
      version: "1.3",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      selfRequestMaxMapAgeDays: {
        type: "number",
        default: 14,
        description: "The max age (in days) a map can be to be prioritized. Set to 0 to allow any self-request.",
        title: "Max map age in days"
      },
      selfRequestLimitPerUser: {
        type: "number",
        default: 1,
        description: "How many times per stream a user can get their own map requests prioritized. Set to 0 to allow any number of self-requests.",
        title: "Max self requests per stream"
      },
      selfRequestSongMessage: {
        type: "string",
        default: "",
        description: "Optionally set a message on a prioritized self-request. If empty, skips adding the message.",
        title: "Message to add to prioritized song requests"
      },
      selfRequestCheckTrigger: {
        type: "enum",
        default: "!bsr",
        description: "Whether to trigger off of the !bsr request message or wait for a \"! bsradd\" confirmation from BSPlus (requires custom setup, see README)",
        title: "Trigger command",
        options: [
          "!bsr",
          "! bsradd"
        ]
      }
    };
  },
  run: (runRequest:RunRequest<Params>) => {

    const { logger, customVariableManager } = runRequest.modules;

    const MAX_SELF_REQUESTS_PER_STREAM = runRequest.parameters.selfRequestLimitPerUser;
    const MAX_MAP_AGE_DAYS = runRequest.parameters.selfRequestMaxMapAgeDays;
    const SELF_REQUEST_SONG_MESSAGE = runRequest.parameters.selfRequestSongMessage;
    const SELF_REQUEST_TRIGGER = runRequest.parameters.selfRequestCheckTrigger
    
    // BSR code
    const songCode = runRequest.trigger.metadata.userCommand?.args?.[ SELF_REQUEST_TRIGGER === '!bsr' ? 0 : 1 ]!;

    // Twitch requester username
    let requesterParam;
    
    switch(runRequest.parameters.selfRequestCheckTrigger) {
      case '!bsr':
        requesterParam = runRequest.trigger.metadata.username.toLowerCase()!;
        break;
      case '! bsradd':
        requesterParam = runRequest.trigger.metadata.userCommand?.args?.[2];
        break;
    }

    if(!requesterParam) {
      return Promise.resolve({
        success: false,
        errorMessage: `Missing argument requester from runRequest`,
        effects: []
      } as ScriptReturnObject);
    }

    const requester = requesterParam.startsWith('@') ? requesterParam.slice(1) : requesterParam;

    // assumed to be normalized into lowercase already
    const mapperLookupDictionary = customVariableManager.getCustomVariable('mapperLookupDictionary', requester) as MapperLookupDictionary;

    const mapperAliases = mapperLookupDictionary?.[requester];

    logger.debug(`Checking song request ${songCode} from ${requester} for mapper self-request...`);

    return new Promise<ScriptReturnObject>((resolve) => {

      if(!mapperAliases) {

        logger.debug(`Requester ${requester} is not a known mapper - skipping self-request check`);

        return resolve({
          success: true,
          errorMessage: '',
          effects: []
        });
      }

      const selfRequestCount = customVariableManager.getCustomVariable(`selfRequestCount_${requester}`) ?? 0;

      if(MAX_SELF_REQUESTS_PER_STREAM > 0 && selfRequestCount > MAX_SELF_REQUESTS_PER_STREAM) {

        logger.debug(`Requester ${requester} has already had ${selfRequestCount} self-requests bumped - skipping request`);;

        return resolve({
          success: true,
          errorMessage: '',
          effects: []
        });
        
      }

      // check the song code
      if(typeof songCode !== 'string' || !/^[0-9a-f]{1,5}$/i.test(songCode)) {

        logger.debug(`Invalid song code ${songCode} - skipping self-request check`);

        return resolve({
          success: true,
          errorMessage: '',
          effects: []
        });
      }

      fetch(`https://api.beatsaver.com/maps/id/${songCode}`).then((response) => {
        return response.json();
      }).then((jsonData:BeatSaverSongData) => {

        if(MAX_MAP_AGE_DAYS > 0) {
          const daysSinceLastPublished = (Date.now() - new Date(jsonData.lastPublishedAt).getTime()) / msPerDay;

          if(daysSinceLastPublished > MAX_MAP_AGE_DAYS) {
            logger.debug(`Song ${songCode} was last published ${daysSinceLastPublished.toFixed(1)} days ago which is greater than max allowable age of ${MAX_MAP_AGE_DAYS} days ago`);

            return resolve({
              success: true,
              errorMessage: '',
              effects: []
            });
          }
        }

        const authorNames = [ jsonData?.uploader?.name.toLowerCase() ];

        jsonData?.collaborators?.forEach((collaborator) => {
            authorNames.push(collaborator?.name.toLowerCase());
        });

        const isSelfRequest = authorNames.some((authorName) => mapperAliases.indexOf(authorName) > -1);

        if(isSelfRequest) {

          customVariableManager.addCustomVariable(`selfRequestCount_${requester}`, selfRequestCount + 1);

          const effects:Effects.Effect[] = [{
            type: 'firebot:chat',
            message: `!mtt ${songCode}`,
            chatter: 'Bot'
          }];

          if(SELF_REQUEST_SONG_MESSAGE) {
            effects.push({
              type: 'firebot:chat',
              message: `!songmsg ${songCode} - Song author self-request`,
              chatter: 'Bot'
            });
          }

          resolve({
            success: true,
            errorMessage: 'None',
            effects: effects
          });
        } else {

          logger.debug(`Map ${songCode} requested by known mapper ${requester} but it doesn't look like they're an author`);

          resolve({
            success: true,
            errorMessage: '',
            effects: []
          });
        }
      }).catch((e) => {

        logger.warn(`Failed to check song ${songCode} for self-request by ${requester}: ${e}`);

        resolve({
          success: false,
          errorMessage: `Failed to check song ${songCode} for self-request by ${requester}: ${e}`,
          effects: []
        } as ScriptReturnObject);

      });
    });
  },
};

export default script;
