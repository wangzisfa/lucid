import type { Tone } from '@/theme/tokens';

export type { Tone };
export { toneColor } from '@/theme/tokens';

/**
 * Chip state shown in the app bar — drives chrome tint + accent color.
 * `${N} LIVE` is the aggregate chip when more than one session runs in parallel.
 */
export type SessionChipState =
  | 'IDLE'
  | 'REC'
  | 'STT'
  | 'GEN'
  | 'PLAN'
  | 'LIVE'
  | 'EDIT'
  | 'CONF'
  | 'KEYS'
  | 'DEPLOY'
  | 'SHIP'
  | `${number} LIVE`;

const FIXED_TONES: Record<string, Exclude<Tone, 'mid' | 'hi'>> = {
  IDLE: 'lo',
  REC: 'rose',
  STT: 'cyan',
  GEN: 'rose',
  PLAN: 'amber',
  LIVE: 'mint',
  EDIT: 'cyan',
  CONF: 'cyan',
  KEYS: 'cyan',
  DEPLOY: 'amber',
  SHIP: 'mint',
};

/** Resolve the accent tone for any chip state, including `${N} LIVE`. */
export const chipTone = (state: SessionChipState): Exclude<Tone, 'mid' | 'hi'> => {
  if (/^\d+ LIVE$/.test(state)) return 'mint';
  return FIXED_TONES[state] ?? 'lo';
};

// ─── domain ──────────────────────────────────────────────

export interface Repo {
  id: string;
  name: string;
  branch: string;
  stack: string;
  state: 'RUN' | 'DRAFT' | 'SHIP' | 'STOP' | 'NEW';
  tone: Tone;
  ageLabel: string;
  /** Path relative to the server's project root that the agent `cd`s into. */
  path: string;
}

export interface Session {
  id: string;
  greekId: string;
  name: string;
  repo: Repo;
  branch: string;
  state: SessionChipState;
  turns: Turn[];
  recElapsed: number;
  interim: string;
  createdAt: number;
}

export type Turn = UserTurn | AgentTurn;

export interface UserTurn {
  id: string;
  kind: 'user';
  text: string;
  voice: boolean;
  duration?: number;
  createdAt: number;
}

export interface AgentTurn {
  id: string;
  kind: 'agent';
  thoughtFor: number;
  filesTouched: number;
  plan: PlanItem[];
  diff?: AgentDiff;
  log: LogLine[];
  approved: boolean;
  ranToCompletion: boolean;
  createdAt: number;
}

export interface PlanItem {
  id: string;
  label: string;
  comment?: string;
  status: 'done' | 'running' | 'pending';
}

export interface AgentDiff {
  path: string;
  added: number;
  removed: number;
  lines: { kind: '+' | '-' | ' '; text: string }[];
}

export interface LogLine {
  prefix?: string;
  prefixTone?: Tone;
  text: string;
  tone?: Tone;
  ts?: string;
}
