/**
 * Server-side domain types shared with the SSE wire format.
 *
 * This is the slim, platform-neutral subset the agent route needs. The full
 * client-side type set (Session, Turn, chip tones, …) lives in the RN app at
 * `src/lib/types.ts`; only these three shapes cross the wire.
 */

export type Tone = 'rose' | 'mint' | 'amber' | 'cyan' | 'violet' | 'lo' | 'mid' | 'hi';

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
