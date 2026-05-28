import type { PlanItem, AgentDiff, LogLine, SessionChipState } from './types';

/**
 * Wire format for events streamed from `/api/agent/run` over SSE. The RN client
 * unwraps each event and calls the matching action in its `useSessions` store.
 * Keep this in sync with the client copy at `src/lib/agent-events.ts`.
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
