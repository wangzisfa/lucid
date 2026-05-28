import type { PlanItem, AgentDiff, LogLine, SessionChipState } from './types';

/**
 * Wire format for events streamed from the server's `/api/agent/run` over SSE.
 * Mirrors the server copy at `server/lib/agent-events.ts`. The client unwraps
 * each event and calls the matching action in `useSessions`.
 */
export type AgentEvent =
  | { type: 'state'; value: SessionChipState }
  | { type: 'plan'; items: PlanItem[] }
  | { type: 'plan-item'; itemId: string; status: PlanItem['status'] }
  | { type: 'diff'; diff: AgentDiff }
  | { type: 'log'; line: LogLine }
  | { type: 'thought'; seconds: number }
  | { type: 'files-touched'; count: number }
  | { type: 'await-approval' }
  | { type: 'done' }
  | { type: 'error'; message: string };
