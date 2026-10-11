using System;
using System.Linq;
using System.Collections.Generic;

public class CPHInline
{
	public bool Execute()
	{
        
        CPH.LogDebug("=========================================== doing raid request check ===========================================");

        CPH.TryGetArg("userName", out string requester);
        var hasRaidRequest = CPH.GetTwitchUserVar<bool>(requester, "hasRaidRequest", false);

        // Check the uploader name first
        if(hasRaidRequest) {

            CPH.LogDebug($"Raid request detected");

            CPH.SetArgument("isRaidrequest", true);

        }

        return true;

	}

}