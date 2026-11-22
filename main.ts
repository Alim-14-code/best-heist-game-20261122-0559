// VAULTBREAK — the hand-in program. Standard library only: it copies
// game/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from the kit's vendor
// library. It never deletes the output directory itself — in the grader
// /output is a mounted volume and removing it fails — it clears only the
// directory's contents. It verifies determinism: it builds twice into two
// scratch directories and refuses to hand in unless both builds are
// byte-identical.
import { buildDossier } from './vendor/makefun-game.ts';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const root = dirname(fileURLToPath(import.meta.url));

// Clear only a directory's contents, never the directory itself.
function clearDirContents(dir) {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTree(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const from = join(src, entry.name);
    const to = join(dst, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else cpSync(from, to);
  }
}

function listFiles(dir, prefix, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) listFiles(path, rel, out);
    else out.push(rel);
  }
  return out;
}

function buildOnce(target) {
  clearDirContents(target);
  copyTree(join(root, 'game'), join(target, 'game'));
  copyTree(join(root, 'screenshots'), join(target, 'screenshots'));
  const dossier = buildDossier(target, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(target, 'dossier.json'), dossier);
}

function assertSameBytes(a, b) {
  const filesA = listFiles(a, '', []).sort();
  const filesB = listFiles(b, '', []).sort();
  if (filesA.join('\n') !== filesB.join('\n')) {
    throw new Error('determinism check failed: file lists differ');
  }
  for (const rel of filesA) {
    const bufA = readFileSync(join(a, rel));
    const bufB = readFileSync(join(b, rel));
    if (!bufA.equals(bufB)) {
      throw new Error('determinism check failed: ' + rel + ' differs between builds');
    }
  }
}

// Build twice into scratch directories and compare byte for byte.
const scratchA = join(tmpdir(), 'vaultbreak-build-a');
const scratchB = join(tmpdir(), 'vaultbreak-build-b');
buildOnce(scratchA);
buildOnce(scratchB);
assertSameBytes(scratchA, scratchB);

// Hand in the verified build.
buildOnce(outDir);
const written = readFileSync(join(outDir, 'dossier.json'));
const rebuilt = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
if (!written.equals(rebuilt)) {
  throw new Error('dossier.json does not match a fresh buildDossier run');
}
console.log('VAULTBREAK handed in: game/ + screenshots/ + dossier.json in ' + outDir);
