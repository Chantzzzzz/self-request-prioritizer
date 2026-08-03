# Streamer.bot Setup

Click "Import" button in Streamerbot and paste the contents of selfRequestPriority.bot.txt into the window that pops up. This will add two new Actions under the "Mapper Self-Request" Group. For basic functionality, this is all that's necessary, but further configuration is available to further tune behaviour.

## Configuration

### Limit Number of Self-Requests

Persisted Global Variable: `maxSelfRequestLimit`

If you want to limit how many prioritized self-requests are allowed per stream, set a persisted global variable named `maxSelfRequestLimit`. If unset, map authors are allowed unlimited prioritized self-requests.

### Self-Request Messages

Persisted Global Variable: `selfRequestSongMessage`

If you want to add a note to any prioritized self-requests, set a persisted global variable named `selfRequestSongMessage` with your desired message (e.g. "Song author self-request"). If set, a `!songmsg` command will be issued after the request is bumped with your configured message.

Note: this adds a decent amount of chat spam. A normal song request is two messages, and the `!mtt` adds another two messages. The `!songmsg` adds yet another two on top of this. Self-requests may be rare enough that it's not a big deal, but consider leaving this setting blank if chat spam bothers you or if your chat is very busy.

## Action Details

### Load Known Mappers

Retrieves a formatted document mapping the Twitch usernames of known mappers into a temporary global "Known Mapper Lookup" to reduce request overhead. This is refreshed on every restart of Streamerbot.

### Mapper Self-Request Check

Triggered by any `!bsr` command in your chat. At a high level, when a request is made by a user in the Known Mapper Lookup, it gets the map info from BeatSaver to see if they are one of the credited authors. If they are, a `!mtt` command will be sent to bump up their map, and `!songmsg` will be set to indicate that it is a self-request. In more detail:

- Wait 5 seconds for Beat Saber to process the `!bsr` command and add it to the request queue.
- Check if there is a limit on self-requests, and if so, whether requester has already had the maximum number of self-requests this stream. If so, it stops executing the action, or continues later checks if not.
- Fetch the map from BeatSaver.
- Look through all of the authors credited on the map to see if they're one of the requester's known author names on BeatSaver.
- If it's a self-request, issue a `!mtt` command to move it up the queue and set `!songmsg` to indicate the self-request, and increment the requester's `selfRequestCount` by 1