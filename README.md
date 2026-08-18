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
site already loads (`projectcoups.dreamhosters.com`). This repo does **not**
include a copy of that data — `data/superchargers.json` is generated, not
committed (see `.gitignore`), so this repo isn't redistributing a copy of
someone else's database. Run the fetch script to pull a fresh snapshot
before serving the site locally (see below).

**Known limitation**: that source isn't kept in sync with every new
Supercharger opening — e.g. Ghent, BE was missing from it as of August 2026,
confirmed against Tesla's own site. That's one of the open questions below.

## Running locally

```bash
python3 scripts/fetch-data.py   # pulls a fresh data/superchargers.json
python3 -m http.server 8791     # serve the site
```

Then open <http://localhost:8791/>.

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
