import { RunRequest, Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";

type Params = {
  raidRequestRedeemTTL: number
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Initialize Author Lookup Dictionary",
      description: "Fetch the mapping of Twitch usernames to BeatSaver author names and load them into memory",
      author: "Chantzzzzz",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      raidRequestRedeemTTL: {
        type: "number",
        default: 2,
        description: "How long (in hours) to allow a raid request to be redeemed. If set to zero, will keep the request available until you restart Firebot.",
        title: "Maximum Redeem Time (Hours)"
      },
    };
  },
  run: (runRequest: RunRequest<Params>) => {

    const { logger, customVariableManager } = runRequest.modules;

    const RAID_REQUEST_REDEEM_TTL_HOURS = runRequest.parameters.raidRequestRedeemTTL;

    let raidRequestTTLSeconds = 0;

    if (!isNaN(RAID_REQUEST_REDEEM_TTL_HOURS) && RAID_REQUEST_REDEEM_TTL_HOURS >= 0) {
      raidRequestTTLSeconds = RAID_REQUEST_REDEEM_TTL_HOURS * 3600;
    }

    // Twitch requester username
    const raiderParam = runRequest.trigger.metadata.username;

    // Normalize username to lowercase remove any potential @ symbols
    const raider = raiderParam.startsWith('@') ? raiderParam.toLowerCase().slice(1) : raiderParam.toLowerCase();

    logger.debug(`Granting raid request to ${raider} for ${raidRequestTTLSeconds} seconds`);

    customVariableManager.addCustomVariable(`hasRaidRequest_${raider}`, 1, raidRequestTTLSeconds);

    return {
      success: true,
      errorMessage: '',
      effects: []
    } as ScriptReturnObject;

  },

};

export default script;
