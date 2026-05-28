import type { Repo } from './types';

/**
 * Repo picker rows. `path` is resolved by the agent server under its project
 * root (`process.cwd()`), so these must exist beside the running server. Demo
 * repos are gitignored — clone or hand-build them next to ./server to make the
 * rows point at real directories.
 */
export const repos: Repo[] = [
  {
    id: 'idea-garden',
    name: 'idea-garden',
    branch: 'main',
    stack: 'next · ts',
    state: 'RUN',
    tone: 'mint',
    ageLabel: '2h',
    path: 'demo-repos/idea-garden',
  },
  {
    id: 'pocket-ledger',
    name: 'pocket-ledger',
    branch: 'main',
    stack: 'expo · ts',
    state: 'DRAFT',
    tone: 'cyan',
    ageLabel: '1d',
    path: 'demo-repos/pocket-ledger',
  },
  {
    id: 'synth-garden',
    name: 'synth-garden',
    branch: 'dev',
    stack: 'vite · ts',
    state: 'SHIP',
    tone: 'amber',
    ageLabel: '3d',
    path: 'demo-repos/synth-garden',
  },
];
