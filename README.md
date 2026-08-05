# Mapper Self-Request Prioritizer

An extension to show the folks who make lovely maps and lightshows a little love by automatically bumping their request in queue if they request their own maps.

Note that this is using a custom mapping to associate BeatSaver profiles to Twitch usernames, since these are often different. Some people may **unintentionally** be missing from this mapping because they're new, I don't know their Twitch username, or some other reason. If you'd like to be added, either message me on discord (same username) or feel free to open up an issue on this repository.

## Supported Bots

- [Streamer.bot](https://streamer.bot/)

## Install Instructions

See the relevant folder's `SETUP.md` for specific installation steps.

## Configuration

### Max Self-Requests

If defined, only allows a specified number of prioritized self-requests per stream. If undefined or set to 0, allows unlimited prioritized self-requests.

### Max Age of Self-Requested Maps

If defined, only allows maps up to maximum number of days old to be priotized. Note this uses **published** date to avoid blocking out maps that get uploaded but published later (such as part of a pack). A map could get through if it's unpublished and republished, but this seems unlikely. If undefined or set to 0, any age of self-requested map will be prioritized.

### Self-Request Message

If defined, sets a message on the song request using `!songmsg` with the specifed message to indicate it is a self-request. If undefined, this is skipped.

## Credits/Acknowledgements

Thank you to [Iza](https://github.com/iza-ttv) whose AI Tag Checker extension I based the structure of this action from.
