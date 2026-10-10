using System;
using System.Linq;
using System.Collections.Generic;

public class CPHInline
{
	public bool Execute()
	{
        int maxMapAgeDays = CPH.GetGlobalVar<int>("selfRequestMaxAgeDays", true);
		
        CPH.LogDebug("=========================================== doing self-request check ===========================================");

        CPH.TryGetArg("userName", out string requester);
        CPH.TryGetArg("map.uploader.name", out string authorName);
        CPH.TryGetArg("map.id", out string songId);

        // Check map age first to see if the map is too old
        if(maxMapAgeDays > 0) {
            CPH.LogDebug($"Checking age of map against max age of {maxMapAgeDays} days...");

            CPH.TryGetArg("map.lastPublishedAt", out string lastPublishedAtString);

            var publishedDate = DateTime.Parse(lastPublishedAtString);

            var diff = DateTime.Now - publishedDate;

            if(diff.Days > maxMapAgeDays) {
                CPH.LogDebug($"Map was published {diff.Days} days ago - skipping self-request");

                return true;
            }
        }
        
        CPH.LogDebug($"Checking request of map {songId} by requester {requester}...");

        var AuthorAliases = new List<string>(); 

        // Load any known aliases of the requester...
        CPH.TryGetArg($"json.twitchUserToBeatSaverProfile.{requester.ToLower()}", out string AuthorAliasesString);

        if(!string.IsNullOrEmpty(AuthorAliasesString)) {
            AuthorAliases.AddRange(AuthorAliasesString.Split(',').ToList());
        }
        

        // Add the Twitch username to the possible aliases
        AuthorAliases.Add(requester.ToLower());

        // Check the uploader name first
        if(AuthorAliases.Contains(authorName.ToLower())) {

            CPH.LogDebug($"Map {songId} is self-requested (author name is {authorName.ToLower()})");

            CPH.SetArgument("isSelfRequest", true);

            return true;
        }

        int maybeCollabIndex = 0;

        // Check through all of the collaborators
        while(true) {
            if(CPH.TryGetArg($"map.collaborators[{maybeCollabIndex}].name", out string collabName)) {
                if(AuthorAliases.Contains(collabName.ToLower())) {
                    CPH.LogDebug($"Map {songId} is self-requested (Collaborator at index {maybeCollabIndex} has name {collabName.ToLower()})");

                    CPH.SetArgument("isSelfRequest", true);

                    return true;
                }
            } else {
                return true;
            }

            maybeCollabIndex++;
        }

	}

}