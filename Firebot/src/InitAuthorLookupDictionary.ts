import { RunRequest, Firebot, ScriptReturnObject } from "@crowbartools/firebot-custom-scripts-types";
import { AuthorLookupDictionary } from "../types/types";

type Params = {
  authorDictionaryJsonUrl: string
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
      authorDictionaryJsonUrl: {
        type: "string",
        default: "https://raw.githubusercontent.com/Chantzzzzz/self-request-prioritizer/refs/heads/main/AuthorData/authorAliasesMinified.json",
        description: "URL to fetch the dictionary of Twitch usernames to Beat Saver profile names",
        title: "Author Lookup Dictionary URL"
      },
    };
  },
  run: (runRequest:RunRequest<Params>) => {

    const { logger, customVariableManager } = runRequest.modules;

    logger.debug(`Loading author dictionary from ${runRequest.parameters.authorDictionaryJsonUrl}`);

    return new Promise<ScriptReturnObject>((resolve) => {
      fetch(runRequest.parameters.authorDictionaryJsonUrl).then((response) => {
        return response.json();
      }).then((jsonData:AuthorLookupDictionary) => {

        logger.debug(`Author dictionary Json fetched successfully - parsing results...`);

        // Normalize whatever data source we're given to all lowercase
        const formattedAuthorDictionary = Object.entries(jsonData.twitchUserToBeatSaverProfile).reduce((dictionary, [twitchUsername, authorAliases]) => {
          return {
            ...dictionary, 
            [twitchUsername.trim().toLowerCase()]: authorAliases.split(',').map((alias:string) => alias.trim().toLowerCase())
          };
        }, {});

        logger.debug(`Loaded ${Object.keys(formattedAuthorDictionary)} usernames successfully`);

        customVariableManager.addCustomVariable('authorLookupDictionary', formattedAuthorDictionary);

        return resolve({
          success: true,
          errorMessage: '',
          effects: []
        } as ScriptReturnObject);

      }).catch((e) => {

        logger.error(`Failed to initialize author lookup dictionary: ${e}`);

        return resolve({
          success: false,
          errorMessage: `Failed to initialize author lookup dictionary: ${e}`,
          effects: []
        } as ScriptReturnObject);

      });

    });
    
  },

};

export default script;
