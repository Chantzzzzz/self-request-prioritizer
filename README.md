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

### Self-Request Message

If defined, sets a message on the song request using `!songmsg` with the specifed message to indicate it is a self-request. If undefined, this is skipped.