# Streamer.bot Setup

Click "Import" button in Streamerbot and paste the contents of `self-request-prioritizer.bot.txt` into the window that pops up. This will add two new Actions under the "Mapper Self-Request" Group and a new `!bsr` command to trigger the action. 

In order for the action to run, you'll need to navigate to the "Commands" tab on the left sidebar and find the `BSR` command. Right click on it and make sure that "Enabled" is checked.

For basic functionality, this is all that's necessary, but further configuration is available to further tune behaviour.

## Configuration

### Limit Number of Self-Requests

Persisted Global Variable: `selfRequestMaxPerUser`

If you want to limit how many prioritized self-requests are allowed per stream, set a **persisted global variable** named `selfRequestMaxPerUser`. 

If unset, map authors are allowed unlimited prioritized self-requests.

### Max Age of Self-Requested Maps

Persisted Global Variable: `selfRequestMaxAgeDays`

If you only want to allow recently published maps to be prioritized, set a **persisted global variable** named `selfRequestMaxAgeDays` to the maximum number of days old a map can be. Note this uses **published** date to avoid blocking out maps that get uploaded but published later (such as part of a pack). A map could get through if it's unpublished and republished, but this seems unlikely. 

If unset, any age of self-requested map will be prioritized.

### Self-Request Messages

Persisted Global Variable: `selfRequestSongMessage`

If you want to add a note to any prioritized self-requests, set a **persisted global variable** named `selfRequestSongMessage` with your desired message (e.g. "Song author self-request"). If set, a `!songmsg` command will be issued after the request is bumped with your configured message.

If left unset, no custom message will be added after the `!mtt` command.

Note: this adds a decent amount of chat spam. A normal song request is two messages, and the `!mtt` adds another two messages. The `!songmsg` adds yet another two on top of this. Self-requests may be rare enough that it's not a big deal, but consider leaving this setting blank if chat spam bothers you or if your chat is very busy.

## Action Details

### Load Known Mappers

Retrieves a formatted document mapping the Twitch usernames of known mappers into a temporary global "Known Mapper Lookup" to reduce request overhead. This is refreshed on every restart of Streamerbot.

### Mapper Self-Request Check

Triggered by any `!bsr` command in your chat. At a high level, when a request is made by a user in the Known Mapper Lookup, it gets the map info from BeatSaver to see if they are one of the credited authors. If they are, a `!mtt` command will be sent to bump up their map, and `!songmsg` will be set to indicate that it is a self-request. In more detail:

- Wait 5 seconds for Beat Saber to process the `!bsr` command and add it to the request queue.
- Check if there is a limit on self-requests, and if so, whether requester has already had the maximum number of self-requests this stream. If they've already reached the limit, the action stops.
- Fetch the map from BeatSaver.
- Check if there's a max map age defined, and if so, whether the map is new enough to be priotized. If it's too old, the action stops.
- Look through all of the authors credited on the map to see if they're one of the requester's known author names on BeatSaver.
- If it's a self-request, issue a `!mtt` command to move it to the top of queue, then increment the requester's `selfRequestCount` by 1.
- Check if `selfRequestSongMessage` is set and, if it is, issue a `!songmsg` command with the saved message text to indicate the self-request.

## Action Info
Title: `Self-Request Prioritizer`
Description: `Monitors Beat Saber song requests to see if they're requested by one of the map authors and, if so, moves it to the top of the queue.`
Version: `1.0.3`