[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Alim-14-code/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Alim-14-code/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# VAULTBREAK

A top-down stealth heist in a night gallery. You are the thief: cross the
room, dodge the guards' vision cones and the sweeping cameras, steal the
Meridian Diamond from the vault, and reach the green EXIT to the getaway
van.

## How it plays

- **Move** with WASD or the arrow keys. **Shift** sneaks: slower, but the
  alarm rises half as fast while you are seen.
- **Shadow pools** hide you: standing in deep blue-violet shadow halves
  the alarm rise again. Light is danger; shadow is cover.
- **Q throws a coin** (3 per run): the nearest guard walks over to
  investigate, marked with a "?". Hunting guards ignore coins.
- **E fires an EMP** (2 per run): the cameras go blind for 6 seconds,
  shown by their cones turning grey — but it costs +12 alarm.
- **The laser grid** across the vault door cycles on and off (3s on, 2s
  off). Cross only while it is dark, or the alarm jumps +20.
- **Guards get suspicious first**: a guard that almost sees you shows
  "!" and turns toward you before it truly sees you.
- The alarm meter fills while you are seen; at 100% the guards hunt you
  until it falls back under 40%. A guard touching you ends the run.
- Loot: the Meridian Diamond ($5,000) in the vault, Gold Bars ($800),
  Cash Stack ($600), Emerald Idol ($1,200). Escape with the diamond for a
  time bonus of up to $3,000.

## Run it

Serve `game/` with any static server and open `game/index.html`, or run
`node serve.ts` if present. `main.ts` hands the entry in: it copies
`game/` and `screenshots/` to the output directory and writes
`dossier.json`. Screenshots are real renders of the game (`?shot=1..4`
freezes the four staged scenes).

Built for the [best-heist-game-20261122-0559](https://make.fun/bounty/best-heist-game-20261122-0559)
bounty on make.fun.
