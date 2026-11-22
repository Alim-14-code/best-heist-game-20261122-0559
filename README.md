# VAULTBREAK

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Alim-14-code/best-heist-game-20261122-0559/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Alim-14-code/best-heist-game-20261122-0559/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

A top-down stealth heist game for the [best heist game bounty](https://make.fun/c/best-heist-game-20261122-0559) on make.fun.

One thief. Three guards. Two cameras. One diamond. Two tools.

## The heist

You are the thief in the Meridian Gallery after dark. Sneak past the
patrolling guards — Rook, Bishop and Knight — slip through the sweeping
security cameras, steal the **Meridian Diamond** from the vault room, grab
what side loot you dare, and reach the green **EXIT** where the getaway van
waits.

- **WASD / arrow keys** — move
- **Shift** — sneak: slower, but guards and cameras spot you far less
  easily
- **Q** — toss a coin: the nearest guard walks off to check the clink
  (3 coins — spend them where they open a route)
- **E** — EMP burst: blinds both cameras for 6 seconds, but the pulse
  is loud and costs 12 alarm (2 charges)
- **P / Esc** — pause
- **Enter** — start, or try again after being caught

The **alarm meter** rises while a guard or camera has you in its vision
cone with a clear line of sight, and cools down while you stay hidden.
At 100% the guards stop patrolling and **hunt** you. If a guard touches
you, the run is over.

Score: loot values plus a time bonus for a fast, clean getaway.

## Play it

Open `game/index.html` in a desktop browser — no build step, no network,
no libraries. Everything is plain canvas 2D and synthesized WebAudio
sound effects.

## Files

- `game/` — the game: `index.html` plus `src/` (config, seeded RNG,
  audio, input, world, guards, tools, render, staged screenshot scenes,
  main loop)
- `screenshots/` — 4 renders of the game itself: the heist in progress
  (coin distraction included), the title screen, a 92% alarm chase with
  the diamond secured, and the caught moment
- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to
  the output directory and writes `dossier.json` with the kit's
  `buildDossier`, verifying the build is byte-deterministic
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
