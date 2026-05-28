/**
 * Chip state shown in TermAppBar — drives chrome tint + accent color.
 *
 * The literal cases cover the single-session lifecycle; `${N} LIVE` is the
 * aggregate chip shown when more than one agent session is running in
 * parallel (matches the `3 LIVE` chip in `08-agents.png`).
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

export type Tone = 'rose' | 'mint' | 'amber' | 'cyan' | 'violet' | 'lo' | 'mid' | 'hi';

const FIXED_TONES: Record<string, Exclude<Tone, 'mid' | 'hi'>> = {
  IDLE:   'lo',
  REC:    'rose',
  STT:    'cyan',
  GEN:    'rose',
  PLAN:   'amber',
  LIVE:   'mint',
  EDIT:   'cyan',
  CONF:   'cyan',
  KEYS:   'cyan',
  DEPLOY: 'amber',
  SHIP:   'mint',
};

/** Resolve the accent tone for any chip state, including `${N} LIVE`. */
export const chipTone = (state: SessionChipState): Exclude<Tone, 'mid' | 'hi'> => {
  if (/^\d+ LIVE$/.test(state)) return 'mint';
  return FIXED_TONES[state] ?? 'lo';
};

export const toneColor = (tone: Tone): string => {
  switch (tone) {
    case 'rose':   return 'var(--rose)';
    case 'mint':   return 'var(--mint)';
    case 'amber':  return 'var(--amber)';
    case 'cyan':   return 'var(--cyan)';
    case 'violet': return 'var(--violet)';
    case 'lo':     return 'var(--text-lo)';
    case 'mid':    return 'var(--text-mid)';
    case 'hi':     return 'var(--text-hi)';
  }
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
  /** Path relative to the project root that the server-side agent `cd`s into. */
  path: string;
}

/**
 * A single coding-agent session. Each session is a self-contained conversation
 * with its own turns, plan, diff, run output, and state chip. Multiple
 * sessions can run in parallel against the same or different repos.
 */
export interface Session {
  id: string;
  /** Symbolic short tag used in the agents list: α β γ δ ε ζ … */
  greekId: string;
  /** Human-readable session name. Derived from first turn text; defaults to greekId. */
  name: string;
  /** Repo being worked on. */
  repo: Repo;
  /** Branch the agent is committing onto. */
  branch: string;
  /** Current chip state. */
  state: SessionChipState;
  /** Ordered conversation history. */
  turns: Turn[];
  /** Transient mic timer + interim transcript. Not persisted. */
  recElapsed: number;
  interim: string;
  createdAt: number;
}

/** A single conversation turn. Either a user voice/text input or an agent response. */
export type Turn = UserTurn | AgentTurn;

export interface UserTurn {
  id: string;
  kind: 'user';
  /** Final transcript text. */
  text: string;
  /** Was this captured via voice? */
  voice: boolean;
  /** Duration in seconds if voice. */
  duration?: number;
  createdAt: number;
}

export interface AgentTurn {
  id: string;
  kind: 'agent';
  /** Total thinking elapsed in seconds (final). */
  thoughtFor: number;
  /** How many files were touched. */
  filesTouched: number;
  /** The plan, in order. */
  plan: PlanItem[];
  /** The unified diff produced (if any). */
  diff?: AgentDiff;
  /** Streamed shell output. */
  log: LogLine[];
  /** Has the user approved the plan? Only meaningful once plan is non-empty. */
  approved: boolean;
  /** Has the run finished? */
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
  /** Optional shell-style prefix: `$`, `→`, `✓`, `●`. */
  prefix?: string;
  prefixTone?: Tone;
  text: string;
  tone?: Tone;
  ts?: string;
}
