# Streamer.bot Setup

Click "Import" button in Streamerbot and paste the contents of `beat-saber-request-prioritizer.bot.txt` into the window that pops up. This will add two new Actions under the "Beat Saber Request Prioritizer" Group and a new `!bsr` command to serve as an action trigger. 

**NOTE**: In order for the action to run, you'll need to navigate to the "Commands" tab on the left sidebar and find the `BSR` command. Right click on it and make sure that "Enabled" is checked.

By default, this extension will prioritize **BOTH** raid-requests and self-requests. See the configuration section if you want to disable one of these.

For basic functionality, this is all that's necessary, but further configuration is available to further tune behaviour.

## Raid Request Configuration

### Disable Prioritizing Raid Requests

Persisted Global Variable: `raidRequestDisabled`

If you want to disable prioritizing raid requests, set a **persisted global variable** named `raidRequestDisabled` set to `True`.

You can also disable the `Grant Raid Request` action if you wish, since it's not necessary.

### Raid Request Message

Persisted Global Variable: `raidRequestSongMessage`

If you want to add a note to any prioritized raid requests, set a **persisted global variable** named `raidRequestSongMessage` with your desired message (e.g. "Raid request!!"). If set, a `!songmsg` command will be issued after the request is bumped with your configured message.

If left unset, the message command will be skipped.

Note: this will increase chat spam. A normal song request is two messages, and the `!mtt` adds another two messages. The `!songmsg` adds yet another two on top of this. Raid requests may be rare enough that it's not a big deal, but consider leaving this setting blank if chat spam bothers you or if your chat is very busy.

## Self-Request Configuration

### Disable Prioritizing Self-Requests

Persisted Global Variable: `selfRequestDisabled`

If you want to disable prioritizing raid requests, set a **persisted global variable** named `selfRequestDisabled` set to `True`.

You can also disable the `Load Author Aliases` action if you wish, since it's not necessary.

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

If left unset, the message command will be skipped.

Note: this will increase chat spam. A normal song request is two messages, and the `!mtt` adds another two messages. The `!songmsg` adds yet another two on top of this. Self-requests may be rare enough that it's not a big deal, but consider leaving this setting blank if chat spam bothers you or if your chat is very busy.

## Action Details

### Load Author Aliases

Retrieves a formatted document mapping the Twitch usernames to BeatSaver profile names in cases where they do not match (or when a user has multiple BeatSaver profiles). This is refreshed on every restart of Streamerbot.

### Priority Request Check

Triggered by any `!bsr` command in your chat. At a high level, when a song request is made, it first checks to see if they've been given a raid request and, if so, bumps their request to the top of the queue and uses up that raid request. If not (or if raid requests are disabled), it checks if they've requested a map they created/collaborated by fetching the map info from BeatSaver to see if they are one of the credited authors. If they are, it bumps their request to the top of the queue. In more detail:

1. Wait 5 seconds for Beat Saber to process the `!bsr` command and add it to the request queue.
2. Check if raid requests are disabled. If so, it skips to step
3. Check if a raid request has been granted to the requester. If so, moves the request to the top of the queue and uses up the raid request and sets a raid request message if configured to do so. The action then stops.
4. Check if self-requests are disabled. If so, the action stops.
5. Check if there is a limit on self-requests. If so, then checks whether requester has already had the maximum number of self-requests this stream. If they've already reached the limit, the action stops.
6. Fetch the map from BeatSaver.
7. Check if there's a max map age defined, and if so, whether the map is new enough to be priotized. If it's too old, the action stops.
8. Check if either the requester's Twitch username or known aliases (if any) are credited as an author/collaborator on the map. If not, the action stops.
9. Bumps the request to the top of queue and sets a self-request message if configured to do so.
10. Increment the requester's `selfRequestCount` by 1.

## Action Info
Title: `Beat Saber Request Prioritizer`
Description: `A bot that monitors your Beat Saber queue to automatically prioritize raid requests and/or author self-requests.`
Version: `1.0.0`