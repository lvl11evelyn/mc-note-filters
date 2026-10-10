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

This script uses a local replacement approach:

1. It watches Masked City's `/events` archive while a Masked City tab is open.
2. It reads each event category from the archive's event tag.
3. It remembers already-seen events.
4. It creates a local desktop notification through the userscript manager only when the event category is enabled.

The script intentionally skips existing archive entries on first run to avoid a notification flood.

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

The script expects the Masked City events archive to expose event rows with `.ev-tag` category labels. If the archive markup changes, the parser may need to be updated.

Because this is a userscript-based filter, it works best when a Masked City tab is open on the desktop browser.
