import { RunRequest, Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";
import { MapperLookupDictionary } from "../types/types";

type Params = {
  mapperDictionaryJsonUrl: string
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Initialize Mapper Lookup Dictionary",
      description: "Fetch the mapping of Twitch usernames to BeatSaver author names and load them into memory",
      author: "Chantzzzzz",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      mapperDictionaryJsonUrl: {
        type: "string",
        default: "https://bso-1.edmontosaurus-fort.ts.net/moppers/mappersMinified.json",
        description: "URL to fetch the dictionary of Twitch usernames to Beat Saver profile names",
        title: "Mapper Lookup Dictionary URL"
      },
    };
  },
  run: (runRequest:RunRequest<Params>) => {

    const { logger, customVariableManager } = runRequest.modules;

    logger.debug(`Loading mapper dictionary from ${runRequest.parameters.mapperDictionaryJsonUrl}`);

    return new Promise<ScriptReturnObject>((resolve) => {
      fetch(runRequest.parameters.mapperDictionaryJsonUrl).then((response) => {
        return response.json();
      }).then((jsonData:MapperLookupDictionary) => {

        logger.debug(`Mapper dictionary Json fetched successfully - parsing results...`);

        // Normalize whatever data source we're given to all lowercase
        const formattedMapperDictionary = Object.entries(jsonData.twitchUserToBeatSaverProfile).reduce((dictionary, [twitchUsername, authorAliases]) => {
          return {
            ...dictionary, 
            [twitchUsername.trim().toLowerCase()]: authorAliases.split(',').map((alias:string) => alias.trim().toLowerCase())
          };
        }, {});

        logger.debug(`Loaded ${Object.keys(formattedMapperDictionary)} usernames successfully`);

        customVariableManager.addCustomVariable('mapperLookupDictionary', formattedMapperDictionary);

        return resolve({
          success: true,
          errorMessage: '',
          effects: []
        } as ScriptReturnObject);

      }).catch((e) => {

        logger.error(`Failed to initialize mapper lookup dictionary: ${e}`);

        return resolve({
          success: false,
          errorMessage: `Failed to initialize mapper lookup dictionary: ${e}`,
          effects: []
        } as ScriptReturnObject);

      });

    });
    
  },

};

export default script;
