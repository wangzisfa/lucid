import { Repo } from './types';

export const repos: Repo[] = [
  {
    id: 'idea-garden',
    name: 'idea-garden',
    branch: 'main',
    stack: 'next · pg',
    state: 'RUN',
    tone: 'mint',
    ageLabel: '2m',
    path: 'demo-repos/idea-garden',
  },
  {
    id: 'quiet-hours',
    name: 'quiet-hours',
    branch: 'main',
    stack: 'expo · rn',
    state: 'DRAFT',
    tone: 'mid',
    ageLabel: '17h',
    path: 'demo-repos/quiet-hours',
  },
  {
    id: 'tide',
    name: 'tide',
    branch: 'main',
    stack: 'vite · sb',
    state: 'SHIP',
    tone: 'cyan',
    ageLabel: '1d',
    path: 'demo-repos/tide',
  },
  {
    id: 'lantern',
    name: 'lantern',
    branch: 'main',
    stack: 'next · sqlite',
    state: 'STOP',
    tone: 'lo',
    ageLabel: '3d',
    path: 'demo-repos/lantern',
  },
  {
    id: 'drift',
    name: 'drift',
    branch: 'main',
    stack: '—',
    state: 'NEW',
    tone: 'rose',
    ageLabel: '—',
    path: 'demo-repos/drift',
  },
];

export const repoById = (id: string) => repos.find((r) => r.id === id);
