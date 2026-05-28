/**
 * Tiny in-memory bus between `/api/agent/run` (which blocks on approval) and
 * `/api/agent/approve` (which resolves it).
 *
 * Keyed by sessionId — there's at most one pending approval per session at a
 * time. Survives only within the Node process, which is fine: the runner only
 * waits while the SSE connection is live, and reloading the page tears down
 * the request anyway.
 */
type Pending = {
  resolve: (allow: boolean) => void;
  abortSignal: AbortSignal;
};

const pending = new Map<string, Pending>();

export function waitForApproval(
  sessionId: string,
  abortSignal: AbortSignal,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const existing = pending.get(sessionId);
    if (existing) existing.resolve(false);

    const entry: Pending = { resolve, abortSignal };
    pending.set(sessionId, entry);

    const onAbort = () => {
      if (pending.get(sessionId) === entry) pending.delete(sessionId);
      resolve(false);
    };
    if (abortSignal.aborted) onAbort();
    else abortSignal.addEventListener('abort', onAbort, { once: true });
  });
}

export function signalApproval(sessionId: string, allow: boolean): boolean {
  const entry = pending.get(sessionId);
  if (!entry) return false;
  pending.delete(sessionId);
  entry.resolve(allow);
  return true;
}
