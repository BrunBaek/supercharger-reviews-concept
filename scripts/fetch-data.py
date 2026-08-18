#!/usr/bin/env python3
"""
Pulls the Supercharger + review dataset from the same public endpoint the
current nowyouknowchannel.com/supercharger-reviews page already loads
(projectcoups.dreamhosters.com), and writes a compact snapshot to
data/superchargers.json for the site to fetch locally.

That snapshot is gitignored on purpose: it's a copy of someone else's
database, so it shouldn't be redistributed via this repo. Run this script
to (re)generate it before serving the site.
"""

import datetime
import json
import urllib.request
from pathlib import Path

SOURCE_URL = "https://projectcoups.dreamhosters.com/superchargers.php"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "superchargers.json"


def fetch_raw():
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def num(value, cast=float):
    try:
        return cast(value)
    except (TypeError, ValueError):
        return None


def transform(raw):
    out = []
    for charger in raw.values():
        reviews = []
        ratings = []
        for r in charger.get("reviews") or []:
            rating = num(r.get("rating"))
            if rating is not None:
                ratings.append(rating)
            reviews.append({"link": r.get("link"), "rating": rating})

        open_date = charger.get("open_date")
        if open_date in ("0000-00-00", "", None):
            open_date = None

        entry = {
            "id": num(charger.get("charger_id"), int),
            "lat": num(charger.get("lat")),
            "lng": num(charger.get("lng")),
            "name": charger.get("name"),
            "street": charger.get("street") or None,
            "city": charger.get("city") or None,
            "state": charger.get("state") or None,
            "country": charger.get("country") or None,
            "status": charger.get("status"),
            "stalls": num(charger.get("stalls"), int),
            "open": open_date,
            "reviews": reviews,
            "avg": round(sum(ratings) / len(ratings), 1) if ratings else None,
        }
        entry = {k: v for k, v in entry.items() if v not in (None, [], "")}
        out.append(entry)

    out.sort(key=lambda c: (c.get("country") or "", c.get("state") or "", c.get("name") or ""))
    return out


def main():
    raw = fetch_raw()
    chargers = transform(raw)

    payload = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": SOURCE_URL,
        "chargers": chargers,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(payload, f, separators=(",", ":"), ensure_ascii=False)

    reviewed = sum(1 for c in chargers if c.get("reviews"))
    print(f"Wrote {len(chargers)} chargers ({reviewed} with reviews) to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
