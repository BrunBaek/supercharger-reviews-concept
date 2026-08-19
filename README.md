# Supercharger Reviews — modern rebuild (concept)

An unofficial, fan-made redesign of the ["Now You Know" Supercharger Reviews](https://www.nowyouknowchannel.com/supercharger-reviews) page.

**Not affiliated with or endorsed by the Now You Know channel.** This was built independently, out of personal interest, and is being shared with the channel as a proposal for them to look at — not a replacement they've asked for or agreed to.

## Status

Early prototype, shared publicly as a concept. Not an official Now You Know
project, and not deployed as a live site (yet) — see "Running locally"
below.

## What this is

A responsive, modern rebuild of the Supercharger Reviews map:

- Interactive map of tracked Superchargers worldwide, with clustering.
- Live search by name, city, state, or country.
- Same review-submission flow as the current site — it embeds the existing
  submission form as-is, so nothing about how people submit reviews changes.
- Works on desktop and mobile, light/dark aware.

## Data

**Credit**: `data/superchargers.json` is a snapshot of the Supercharger
location and review data from `projectcoups.dreamhosters.com` — the same
public, unauthenticated endpoint the current nowyouknowchannel.com
Supercharger Reviews page already loads for every visitor. It's included
here as-is, unmodified, so this repo runs out of the box. All credit for
that dataset — including the review videos and ratings submitted by Now
You Know's community — belongs to them. Re-run `scripts/fetch-data.py`
any time to refresh the snapshot.

**Known limitation**: that source isn't kept in sync with every new
Supercharger opening — e.g. Ghent, BE was missing from it as of August 2026,
confirmed against Tesla's own site. That's one of the open questions below.

## Running locally

There's no live preview URL (yet) — to see it, run it on your own machine:

1. Clone this repo and open a terminal in it.
2. Optional — refresh the data snapshot: `python3 scripts/fetch-data.py`
3. Start a local server: `python3 -m http.server 8791`
4. In your browser, go to `http://localhost:8791/`

## Open questions for the Now You Know team

If there's any interest in taking this further, these are the things worth
figuring out together before anything goes live:

- Where does the "new superchargers" segment source its list from — and
  could that feed into this database automatically, so new sites don't need
  to be added by hand?
- Should the review-submission form change too, or stay as-is?
- Data ownership/hosting going forward, and who maintains what.

## Rights

The code and design here are shared publicly as a concept, but no license
is granted — all rights reserved for now. The Supercharger dataset in
`data/superchargers.json` is not mine: see "Data" above for its source and
credit. If you're from Now You Know and have any concerns about this repo,
please open an issue or get in touch.
