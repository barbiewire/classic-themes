# Classic ROBLOX
> These are CUSTOM NOTES I wrote for myself incase I forget something, not too important.
> README contains the consumer-related stuff, sort of like a thing for stupid people.

Chrome extension that skins roblox.com to look like the late-2011 site.

The images in `img/` are the real 2011 ones, pulled from the Wayback Machine
(`roblox.com/images/cssspecific/rbx2/`, snapshot 2011-10-01). Colours and sizes
come from that snapshot's `AllCSS.ashx`.

## Install

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** and pick this folder
4. Refresh any open Roblox tabs

The toolbar icon opens the skin picker: **2011**, **2008-2010** or **Off**. One at a time,
and it applies to open tabs without a reload.

## Skins

Pick one in the toolbar popup, it swaps straight away on open tabs.

- **2008-2010** - the city banner strip, flat #6e99c9 nav and headers, Verdana, light blue
  page column with grey edges, white boxes with blue borders.
- **2011-2012** - the "rbx2" look: big banner art, blue sprite nav bar, black tab headers,
  the wooden alerts sign, Arial.
- **2014** - dark grey 50px top bar with the white wordmark, white 900px page, green buttons,
  Source Sans Pro.
- **2015-2016** - blue #0074bd 80px bar, grey #e3e3e3 page, flat white cards, green/blue
  buttons, and a 175px white left rail of its own (the 2025 sidebar is 289px of rounded pills
  and tucked under the taller bar, so it gets hidden).

Hovering a home tile still expands it into the panel with the name, play button and
like/dislike bar - that is the site's own feature, the skin just repaints it.

The first two inject the old banner and nav bar. The last two had no banner, so those restyle
the real site header into that era's bar and leave the site nav in place.

## Newer pages and popups

Anything the site built recently (the friend popover, the location picker, the Plus page) is
Foundation, and it reads its colours and corners from css tokens rather than the class names
the rest of this file hooks. The skin repoints those tokens per era, so those bits follow along
- squared corners, era surfaces, era font. Their *layout* stays modern: there is no 2011 version
of the Plus page to copy.

Section headers only get the black tab where they really are a title bar over a list. Elsewhere
(transactions, groups, ...) that same class holds a title AND a balance AND a button, and forcing
those into one 33px row made them overlap.

## What it changes

- 2011 banner, the blue nav bar (My ROBLOX / Games / Catalog / People / Builders Club / Forum / News / Parents / Help).
  Builders Club goes to Roblox Plus, Forum to the DevForum.
- "Logged in as ..." tab with a working Logout
- The sign above the nav shows unread messages, friend requests and ROBUX
- Left sidebar is gone, its links are in the My ROBLOX dropdown
- Search and notifications stay, shrunk into a tab in the top-right corner
- Black tab section headers, white boxes, Arial, square thumbnails, 2011 buttons, green Play button on game pages
- Wording in section headers: Experiences -> Games, Marketplace -> Catalog, Communities -> Groups, Connections -> Friends
- Forces light theme while on (the skin is light only), puts dark back when switched off

## Notes

Roblox changes its markup often. Most selectors target the older `rbx-*` class names, which have stuck
around for years, but if something breaks after a site update it's probably a renamed class in `classic.css`.

## ads

the OLD ADS toggle shows real user made adverts from
https://archive.org/details/RobloxAdverts (uploaded by plescatoma, 2019)

none of them are stored in this repo. bg.js fetches one from archive.org the first time
it gets shown and caches it in chrome.storage.local, because roblox csp is
img-src self data: *.rbxcdn.com so an archive.org url in an <img> gets blocked outright

the ads belong to whoever drew them, this only displays them

(the 34 hand drawn placeholder ads that used to live in img/ads are in git history at 01e6f64)
