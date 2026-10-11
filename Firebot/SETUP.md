# Firebot Setup



## Enabling Custom scripts

In Firebot, click the `Settings` tab on left navigation bar, and then click on the `Scripts` tab in the new panel. Make sure that `Custom Scripts` is toggled on.



## Installing Scripts

Open the `File` menu and click on `Open Data Folder`. This will open a file explorer where your Firebot profile is located. In this directory, open the `scripts` folder and place `PriorityRequestCheck.js`, `GrantRaidRequest.js`, and `InitAuthorLookupDictionary.js` in there.



## Startup Script Configuration

Navigate back to the `Settings -> Scripts` menu and click on `Manage Startup Scripts`. In the popup that opens, click the `Add New Script` button and in the dialogue that appears, select `InitAuthorLookupDictionary.js` in the dropdown. In the `Settings` section below the dropdown, you can optionally override the URL that the dictionary is fetched from. It is not recommended to override this unless you want to load your own custom author dictionary.

#### Author Dictionary JSON Format

Want to make your own lookup dictionary? You'll need to create a JSON file following the format below. Note that the Twitch usernames serve as the dictionary keys in `twitchUserToBeatSaverProfile`, and the corresponding value is a **comma-separated string of Beat Saber profile names** and _not_ an array of strings. This was done because JSON parsing in Streamer.bot was weird.

This file only needs to define any Twitch users who have BeatSaver profile names that differ from their Twitch username.

```
{
    twitchUserToBeatSaverProfile: {
        "twitchUsername": "beatSaverProfileName_1,beatSaverProfileName_2",
        "anotherTwitchUsername": "beatSaverProfileName_3,beatSaverProfileName_4"
    },
    lastUpdated: [millisecondsSinceEpoch]
}
```



## Incoming Raid Event Setup

In Firebot, click the `Events` tab, then click `New Event`. In the modal that pops up, open the `Trigger On` dropdown and search for `Incoming Raid` and select it. You'll want to add the following effects to the Effect Queue using the `Add Effect` button:

1. **Run Custom Script**

Select the `GrantRaidRequest.js` script in the dropdown. In the `Settings` section below, configure the following options to your liking:

### Maximum Redeem Time (Hours)

How long the raider's request is valid for, in hours. If you only want to allow a raid request to be bumped for a short time following the raid event, you can set this to a desired time frame (decimal values are valid). If you set it to zero, the raid request can be redeemed at any time until Firebot is restarted.



## Chat Command Setup

In Firebot, click the `Commands` tab, then click `New Custom Command`. In the modal that pops up, set the `Trigger` field to `!bsr` and make sure that `Enabled` is checked. You'll want to add the following effects to the Effect Queue using the `Add Effect` button:

1. **Delay**

It can take a few seconds for BeatSaberPlus to acknowledge a song request and add it to the queue, so we need to delay the bot actions a bit. **I recommend adding at least 5 seconds**, but if you're noticing the bot acting too quickly, try increasing this to 8-10 seconds.

2. **Run Custom Script**

Select the `PriorityRequestCheck.js` script in the dropdown. In the `Settings` section below, configure the following options to your liking:

### Enable Priority Raid Requests

Whether to prioritize raid requests from users who have raided you.

### Raid Request Message

If you want to add a note to any prioritized raid requests, set this field with your desired message (defaults to "Raid request from `<raider_username>`"). If set, a `!songmsg` command will be issued after the request is bumped with your configured message. If you want the raider's username in the message, you can use `<raider_username>` in the message text and it will get replaced with their username.

Note: this adds a decent amount of chat spam. A normal song request is two messages, and the `!mtt` adds another two messages. The `!songmsg` adds yet another two on top of this. Consider leaving this field blank if your chat is very busy or the extra messages aren't useful for your stream.

Making this field blank skips the `!songmsg` command.

### Enable Priority Self-Requests

Whether to prioritize a request when a user requests a map they created/collaborated on.

### Max Self-Request Map Age (days)

How recently the map must have been published (in days) in order to be prioritized. Note that this uses the *last published date* which can technically be abused, but is the best way to make sure that a map that is uploaded but not published immediately doesn't get skipped (such as maps uploaded as part of a pack in advance of some later release date).

Set to `0` or delete to allow any age of map.

### Max Self-Requests Per Stream

How many times a requester can have their maps prioritized per stream.

Set to `0` or delete to allow unlimited prioritized self-requests.

### Self-Request Message

If you want to add a note to any prioritized self-requests, set this field with your desired message (defaults to "Song author self-request"). If set, a `!songmsg` command will be issued after the request is bumped with your configured message.

Note: this adds a decent amount of chat spam. A normal song request is two messages, and the `!mtt` adds another two messages. The `!songmsg` adds yet another two on top of this.

Making this field blank skips the `!songmsg` command.

### Chat Account

Whether to use your Streamer or Bot account to send chat messages.

Defaults to `Streamer`.

### Fall Back To Streamer Account

Whether to fall back to your Streamer account if your Bot account is unavailable or not configured. 

Defauls to `true`.