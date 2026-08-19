# Supercharger Reviews — modern rebuild (concept)

An unofficial, fan-made redesign of the ["Now You Know" Supercharger Reviews](https://www.nowyouknowchannel.com/supercharger-reviews) page.

**Not affiliated with or endorsed by the Now You Know channel.** This was built independently, out of personal interest, and is being shared with the channel as a proposal for them to look at — not a replacement they've asked for or agreed to.

## Status

Early prototype. Not deployed anywhere public. Built and tested locally only.

## What this is

A responsive, modern rebuild of the Supercharger Reviews map:

- Interactive map of tracked Superchargers worldwide, with clustering.
- Live search by name, city, state, or country.
- Same review-submission flow as the current site — it embeds the existing
  submission form as-is, so nothing about how people submit reviews changes.
- Works on desktop and mobile, light/dark aware.

## Data

Location and review data comes from the same public endpoint the current
site already loads (`projectcoups.dreamhosters.com`). `data/superchargers.json`
is a snapshot of that data, included here so the repo runs out of the box.
This repo is **private**, shared only with the Now You Know team for
review — it isn't public redistribution of their database. Re-run the fetch
script any time to refresh the snapshot (see below); if this project ever
goes public, that snapshot should come back out (see `scripts/fetch-data.py`).

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

No license granted. Shared privately for the Now You Know team's review —
please don't redistribute.
