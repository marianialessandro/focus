# DriftQuell

A Chrome Manifest V3 extension for blocking distracting websites manually or through configurable weekly schedules.

## Features

- Immediate manual blocking from the popup.
- Persistent weekly schedules with customizable days and time ranges.
- Support for time ranges that cross midnight.
- Reusable and combinable lists of domains and URLs to block.
- Additional rules and exceptions for each schedule.
- Light, dark, and automatic system theme support.
- Dedicated settings page with sidebar navigation.

## Installation

1. Clone or download the repository.
2. Open `chrome://extensions` in Chrome.
3. Enable Developer mode.
4. Select **Load unpacked**.
5. Choose the project directory.

Whenever the manifest changes, use the **Reload** button on the extensions page. The extension requires access to websites because the list of domains to block is configured by the user.

## Popup

The popup displays the current status and lets you enable or disable manual blocking. The settings icon in the top-right corner opens the settings page in a new tab.

When a schedule is active, the manual blocking button is disabled and the popup indicates which time range is controlling the block.

## Site lists

The **Site lists** section lets you create multiple reusable collections. A website may belong to more than one list, and each list can be marked as **Default**. The union of all default lists is used for manual blocking. Lists are displayed in a compact form and can be expanded by clicking their header.

Lists accept values such as:

- `reddit.com`, to block the entire domain and its subdomains.
- `reddit.com/r/popular`, to block a specific path.
- `https://www.youtube.com/shorts`, which is normalized automatically.

The previous global list is automatically migrated to a list named **Default**. YouTube, Instagram, and Netflix are included in the initial configuration and can be changed or removed.

## Schedules

Each schedule contains:

- An optional name.
- An enabled or disabled state.
- One or more days of the week.
- A start and end time.
- An optional start and end date.
- One or more site lists. Default lists must also be selected explicitly.
- Additional links to block only during that schedule.
- Links that must remain accessible during that schedule.

A Monday schedule from `22:00` to `02:00` remains active until `02:00` on Tuesday.

Every schedule must effectively block at least one website through a selected list or **Also block**. A configuration where **Do not block** excludes every blocked website is invalid.

Date boundaries are inclusive and may be left empty to create a schedule with no expiration or only one boundary. For an overnight time range, the date range is evaluated against the day on which the range starts.

### Schedule exceptions

An expanded schedule contains two groups:

- **Also block** adds domains or URLs to the blocking rules only while that schedule is active.
- **Do not block** creates temporary exceptions that take priority over blocking rules.

When multiple schedules are active at the same time, their lists are combined. Active exceptions take priority over blocking rules, including rules for specific paths.

When a schedule contains websites entered manually under **Also block**, saving offers to turn them into a reusable list. If accepted, the list is created and linked to the schedule automatically; otherwise, the websites remain local customizations for that schedule.

## Persistence and updates

Settings, schedules, websites, and theme preferences are stored in `chrome.storage.local` and remain available after Chrome is closed or the computer is restarted.

An internal alarm reevaluates schedules at the beginning of every minute. State is also recalculated when Chrome starts, when the popup opens, and after each save.

## Project structure

- `src/background/`: persistent state, schedules, and dynamic blocking rules.
- `src/options/`: settings page.
- `src/popup/`: extension popup.
- `src/blocked/`: page displayed when navigation is blocked.
- `src/shared/`: theme shared across pages.

Interface icons come from [Lucide](https://lucide.dev/) and are distributed under the ISC license.
