# Masked City Notification Filtering

A userscript that adds local category filtering for Masked City desktop notifications.

The script adds a **Filter Notifications** button beside Masked City's native notification control on the Preferences settings page. From there, you can enable local filtered notifications and choose which event categories should produce desktop alerts.

## Install

Install with a userscript manager such as Tampermonkey or Violentmonkey:

https://github.com/lvl11evelyn/mc-note-filters/raw/refs/heads/main/MaskedCity_Filtered_Desktop_Notes.user.js

The script runs on:

- `https://maskedcity.com/*`
- `https://www.maskedcity.com/*`

## How It Works

Masked City's native push notifications are delivered through the site's service worker. Because those notifications are created outside the page context, a userscript cannot directly filter the native push payloads.

This script is being built around a local replacement approach:

1. It observes in-page Masked City notification banners while a Masked City tab is open.
2. It reads each banner's category from the live page markup.
3. It creates a local desktop notification through the userscript manager only when the event category is enabled.

The script does not fetch the event archive or make background requests to Masked City.

## Setup

1. Install the userscript.
2. Open Masked City in Firefox.
3. Go to **Settings -> Preferences**.
4. Use **Filter Notifications** to choose the categories you want.
5. Enable the filter inside the popover.
6. In your browser's site notification settings, disable Masked City's native desktop notification permission for this browser profile.
7. Allow notifications from your userscript manager if it asks for permission.
8. Keep Masked City's in-game notification setting enabled.

The intended setup is:

- Phone notifications remain handled by Masked City's native push system.
- Desktop Firefox suppresses Masked City's native push notifications.
- This userscript creates filtered replacement notifications on desktop through the userscript manager.

## Categories

The current category set is:

- Combat
- Watchtower
- The Wire
- The Mirage
- MCC
- Street
- Pets
- Transfers
- Achievements
- Level Up
- Donator
- Social
- Other

## Notes

This setting only affects the browser profile currently logged in.

The live banner observer still needs to be wired to the final in-game notification banner markup. The current version includes the settings UI and category test-fire buttons, but does not fetch `/events`.

Because this is a userscript-based filter, it works best when a Masked City tab is open on the desktop browser.
