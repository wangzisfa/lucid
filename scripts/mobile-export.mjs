// Produce a static client bundle (`out/`) for the Capacitor Android shell.
//
// Next.js can't statically export route handlers (`app/api/agent/*` are
// force-dynamic POST/SSE), so we temporarily move the api dir out of `app/`,
// run `next build` with MOBILE_EXPORT=1, then always move it back — even if the
// build fails. The bundled app talks to a remote server (configured in-app),
// so dropping the local api routes from the static build is exactly right.

import { spawnSync } from 'node:child_process';
import { existsSync, renameSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'app', 'api');
const stashDir = path.join(root, '.mobile-export-stash');

let stashed = false;
if (existsSync(apiDir)) {
  rmSync(stashDir, { recursive: true, force: true });
  mkdirSync(stashDir, { recursive: true });
  renameSync(apiDir, path.join(stashDir, 'api'));
  stashed = true;
  console.log('[mobile-export] moved app/api aside');
}

let code = 1;
try {
  const r = spawnSync('npx', ['next', 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, MOBILE_EXPORT: '1' },
  });
  code = r.status ?? 1;
} finally {
  if (stashed) {
    renameSync(path.join(stashDir, 'api'), apiDir);
    rmSync(stashDir, { recursive: true, force: true });
    console.log('[mobile-export] restored app/api');
  }
}

if (code !== 0) process.exit(code);
console.log('[mobile-export] static bundle ready in out/');
