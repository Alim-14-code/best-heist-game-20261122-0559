// VAULTBREAK — hand-in program for best-heist-game-20261122-0559.
// Copies game/ and screenshots/ from this repository to the output
// directory and writes /output/dossier.json with buildDossier from the
// kit's vendor/makefun-game.ts. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output. Verifies determinism: the dossier is rebuilt
// from the written output and from a second clean build, and both must
// match the written bytes exactly.
import { buildDossier } from './vendor/makefun-game.ts';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
};

function clearDirContents(dir) {
  // Clear only the contents of dir, never dir itself: in the grader
  // /output is a mounted volume and removing the mount point fails
  // with EBUSY. mkdir first so a missing dir is created.
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function buildInto(dir) {
  clearDirContents(dir);
  mkdirSync(join(dir, 'game'), { recursive: true });
  mkdirSync(join(dir, 'screenshots'), { recursive: true });
  cpSync(join(REPO_ROOT, 'game'), join(dir, 'game'), { recursive: true });
  cpSync(join(REPO_ROOT, 'screenshots'), join(dir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(dir, CAPS);
  writeFileSync(join(dir, 'dossier.json'), dossier);
  return dossier;
}

const dossier = buildInto(OUT);

// Self-check 1: rebuild the dossier from the written output; it must
// equal the bytes just written (buildDossier reads game/ + screenshots/
// only, so dossier.json itself does not affect the rebuild).
const rebuilt = buildDossier(OUT, CAPS);
const written = readFileSync(join(OUT, 'dossier.json'));
if (!Buffer.from(rebuilt).equals(written)) {
  throw new Error('dossier.json does not match a rebuild of the output');
}

// Self-check 2: a second clean build in a scratch directory must produce
// byte-identical output.
const scratch = mkdtempSync(join(tmpdir(), 'vaultbreak-'));
try {
  const dossier2 = buildInto(scratch);
  if (!Buffer.from(dossier2).equals(Buffer.from(dossier))) {
    throw new Error('second clean build produced a different dossier');
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (!existsSync(join(OUT, 'game', 'index.html'))) {
  throw new Error('game/index.html missing from output');
}
console.log(`VAULTBREAK hand-in complete: ${OUT} (${written.length} byte dossier.json)`);
