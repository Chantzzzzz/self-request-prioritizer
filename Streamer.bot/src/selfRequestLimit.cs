using System;
using System.Linq;
using System.Collections.Generic;

public class CPHInline
{
	public bool Execute()
	{
        CPH.TryGetArg("userName", out string requester);

        int maxSelfRequestLimit = CPH.GetGlobalVar<int>("selfRequestMaxPerUser", true);

        int userSelfRequests = CPH.GetTwitchUserVar<int>(requester, "selfRequestCount", false);

        CPH.LogDebug($"Checking maxSelfRequest limit of {maxSelfRequestLimit} for requester {requester} (they've had {userSelfRequests} self-requests so far)");

        if(maxSelfRequestLimit > 0 && userSelfRequests >= maxSelfRequestLimit) {
            CPH.LogDebug($"User {requester} has already had {userSelfRequests} requests this session - skipping");

            CPH.SetArgument("selfRequestLimitReached", true);
        }

        return true;
		
	}
}