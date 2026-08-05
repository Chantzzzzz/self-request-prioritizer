# Firebot Setup

In order to use this integration, you will need to install custom scripts. **Installing custom scripts is risky and should only be done if you trust the author!** I'm making this to help people out, not hack your computer, but you should always make sure you trust the source of scripts before installing anything.

## Enabling Custom scripts

In Firebot, click the `Settings` tab on left navigation bar, and then click on the `Scripts` tab in the new panel. Make sure that `Custom Scripts` is toggled on.

## Installing Scripts

Open the `File` menu and click on `Open Data Folder`. This will open a file explorer where your Firebot profile is located. In this directory, open the `scripts` folder and place both `MapperSelfRequestCheck.js` and `InitMapperLookupDictionary.js` in there.

## Startup Script Configuration

Navigate back to the `Settings -> Scripts` menu and click on `Manage Startup Scripts`. In the popup that opens, click the `Add New Script` button and in the dialogue that appears, select `InitMapperLookupDictionary.js` in the dropdown. In the `Settings` section below the dropdown, you can optionally override the URL that the dictionary is fetched from. It is not recommended to override this unless you want to load your own custom mapper dictionary.

### Mapper Dictionary JSON Format

Want to make your own lookup dictionary? This is what you'll need to provide

```
{
    twitchUserToBeatSaverProfile: {
        "[twitchUsername]": "[beatSaverProfileName_1],[beatSaverProfileName_2]",
        "[anotherTwitchUsername]": "[beatSaverProfileName_3],[beatSaverProfileName_4]"
    },
    lastUpdated: [millisecondsSinceEpoch]
}
```

## Chat Command Setup

TODO