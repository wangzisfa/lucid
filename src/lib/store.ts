import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AgentTurn,
  PlanItem,
  Repo,
  Session,
  SessionChipState,
  Turn,
  UserTurn,
  AgentDiff,
  LogLine,
} from './types';
import { runAgentScript, agentApiBase } from './agent-client';

const newId = () => Math.random().toString(36).slice(2, 10);

const GREEK = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ'];
const greekFor = (count: number) =>
  count < GREEK.length ? GREEK[count] : `s${count + 1}`;

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'with', 'for', 'on', 'in', 'at', 'to', 'of', 'by',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'that', 'this', 'please',
  'can', 'could', 'would', 'should', 'want', 'need', 'make', 'let', 'have', 'has',
]);

/** Derive a kebab-cased branch-style name from a freeform user prompt. */
function deriveName(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w));
  const candidate = words.slice(0, 4).join('-').slice(0, 32);
  return candidate || 'untitled';
}

/**
 * Per-session chip derived from history. Used on rehydrate to keep the chip
 * honest after the app is reopened.
 *   awaiting approval    → PLAN
 *   approved (any state) → LIVE  (interrupted runs treated as complete)
 *   no agent turns       → IDLE
 */
function chipFromHistory(turns: Turn[]): SessionChipState {
  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i];
    if (t.kind !== 'agent') continue;
    if (t.plan.length > 0 && !t.approved) return 'PLAN';
    return 'LIVE';
  }
  return 'IDLE';
}

/** Throw away in-flight thinking turns (no plan yet) — their runners are dead. */
function dropGhostTurns(turns: Turn[]): Turn[] {
  return turns.filter((t) => {
    if (t.kind === 'user') return true;
    return t.plan.length > 0 || !!t.diff || t.log.length > 0;
  });
}

// ─── store shape ─────────────────────────────────────────

export interface SessionsStoreShape {
  sessions: Record<string, Session>;
  order: string[];
  activeId: string | null;

  spawnSession: (repo: Repo, name?: string) => string;
  closeSession: (id: string) => void;
  setActive: (id: string) => void;
  resetAll: () => void;

  setState: (sessionId: string, state: SessionChipState) => void;

  beginRecording: (sessionId: string) => void;
  updateRecording: (sessionId: string, elapsed: number, interim: string) => void;
  cancelRecording: (sessionId: string) => void;

  finishVoiceTurn: (sessionId: string, transcript: string, duration: number) => void;
  submitTextTurn: (sessionId: string, text: string) => void;

  approveLatestPlan: (sessionId: string) => void;

  _appendTurn: (sessionId: string, turn: Turn) => void;
  _patchAgentTurn: (sessionId: string, turnId: string, patch: Partial<AgentTurn>) => void;
  _updatePlanItem: (sessionId: string, turnId: string, itemId: string, patch: Partial<PlanItem>) => void;
  _appendLog: (sessionId: string, turnId: string, line: LogLine) => void;
  _setDiff: (sessionId: string, turnId: string, diff: AgentDiff) => void;
}

/**
 * Multi-session store. `useSessions` is the canonical hook — consumers that
 * care about *the active session* should use `useActiveSession()`. Persisted to
 * AsyncStorage under `lucid:sessions:v2`.
 */
export const useSessions = create<SessionsStoreShape>()(
  persist(
    (set, get) => ({
      sessions: {},
      order: [],
      activeId: null,

      spawnSession: (repo, name) => {
        const id = newId();
        const greekId = greekFor(get().order.length);
        const session: Session = {
          id,
          greekId,
          name: name?.trim() || greekId,
          repo,
          branch: repo.branch,
          state: 'IDLE',
          turns: [],
          recElapsed: 0,
          interim: '',
          createdAt: Date.now(),
        };
        set((s) => ({
          sessions: { ...s.sessions, [id]: session },
          order: [...s.order, id],
          activeId: id,
        }));
        return id;
      },

      closeSession: (id) => {
        const { order, activeId } = get();
        const nextOrder = order.filter((x) => x !== id);
        const nextSessions = { ...get().sessions };
        delete nextSessions[id];
        const nextActive =
          activeId === id ? nextOrder[nextOrder.length - 1] ?? null : activeId;
        set({ sessions: nextSessions, order: nextOrder, activeId: nextActive });
      },

      setActive: (id) => {
        if (!get().sessions[id]) return;
        set({ activeId: id });
      },

      resetAll: () => set({ sessions: {}, order: [], activeId: null }),

      setState: (sessionId, state) =>
        set((s) => {
          const cur = s.sessions[sessionId];
          if (!cur || cur.state === state) return s;
          return { sessions: patchSession(s.sessions, sessionId, { state }) };
        }),

      beginRecording: (sessionId) =>
        set((s) => ({
          sessions: patchSession(s.sessions, sessionId, {
            state: 'REC',
            recElapsed: 0,
            interim: '',
          }),
        })),

      updateRecording: (sessionId, elapsed, interim) =>
        set((s) => ({
          sessions: patchSession(s.sessions, sessionId, { recElapsed: elapsed, interim }),
        })),

      cancelRecording: (sessionId) =>
        set((s) => ({
          sessions: patchSession(s.sessions, sessionId, {
            state: 'IDLE',
            recElapsed: 0,
            interim: '',
          }),
        })),

      finishVoiceTurn: (sessionId, transcript, duration) => {
        const text = transcript.trim();
        if (!text) {
          set((s) => ({
            sessions: patchSession(s.sessions, sessionId, {
              state: 'IDLE',
              recElapsed: 0,
              interim: '',
            }),
          }));
          return;
        }
        const session = get().sessions[sessionId];
        if (!session) return;

        const isFirstTurn = session.turns.length === 0;
        const nextName =
          isFirstTurn && session.name === session.greekId
            ? deriveName(text)
            : session.name;

        set((s) => ({
          sessions: patchSession(s.sessions, sessionId, {
            state: 'STT',
            recElapsed: 0,
            interim: '',
            name: nextName,
          }),
        }));

        const turn: UserTurn = {
          id: newId(),
          kind: 'user',
          text,
          voice: true,
          duration,
          createdAt: Date.now(),
        };
        get()._appendTurn(sessionId, turn);

        setTimeout(() => {
          runAgentScript({ sessionId, userText: text });
        }, 600);
      },

      submitTextTurn: (sessionId, text) => {
        const t = text.trim();
        if (!t) return;
        const session = get().sessions[sessionId];
        if (!session) return;

        const isFirstTurn = session.turns.length === 0;
        if (isFirstTurn && session.name === session.greekId) {
          set((s) => ({
            sessions: patchSession(s.sessions, sessionId, { name: deriveName(t) }),
          }));
        }

        const turn: UserTurn = {
          id: newId(),
          kind: 'user',
          text: t,
          voice: false,
          createdAt: Date.now(),
        };
        get()._appendTurn(sessionId, turn);
        runAgentScript({ sessionId, userText: t });
      },

      approveLatestPlan: (sessionId) => {
        const session = get().sessions[sessionId];
        if (!session) return;
        for (let i = session.turns.length - 1; i >= 0; i--) {
          const t = session.turns[i];
          if (t.kind === 'agent' && t.plan.length > 0 && !t.approved) {
            get()._patchAgentTurn(sessionId, t.id, { approved: true });
            // Release the server-side approval gate. Best-effort.
            void fetch(`${agentApiBase()}/api/agent/approve`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ sessionId, allow: true }),
            }).catch(() => undefined);
            return;
          }
        }
      },

      _appendTurn: (sessionId, turn) =>
        set((s) => {
          const sess = s.sessions[sessionId];
          if (!sess) return s;
          return {
            sessions: patchSession(s.sessions, sessionId, {
              turns: [...sess.turns, turn],
            }),
          };
        }),

      _patchAgentTurn: (sessionId, turnId, patch) =>
        set((s) => {
          const sess = s.sessions[sessionId];
          if (!sess) return s;
          return {
            sessions: patchSession(s.sessions, sessionId, {
              turns: sess.turns.map((t) =>
                t.kind === 'agent' && t.id === turnId ? { ...t, ...patch } : t,
              ),
            }),
          };
        }),

      _updatePlanItem: (sessionId, turnId, itemId, patch) =>
        set((s) => {
          const sess = s.sessions[sessionId];
          if (!sess) return s;
          return {
            sessions: patchSession(s.sessions, sessionId, {
              turns: sess.turns.map((t) => {
                if (t.kind !== 'agent' || t.id !== turnId) return t;
                return {
                  ...t,
                  plan: t.plan.map((p) => (p.id === itemId ? { ...p, ...patch } : p)),
                };
              }),
            }),
          };
        }),

      _appendLog: (sessionId, turnId, line) =>
        set((s) => {
          const sess = s.sessions[sessionId];
          if (!sess) return s;
          return {
            sessions: patchSession(s.sessions, sessionId, {
              turns: sess.turns.map((t) =>
                t.kind === 'agent' && t.id === turnId
                  ? { ...t, log: [...t.log, line] }
                  : t,
              ),
            }),
          };
        }),

      _setDiff: (sessionId, turnId, diff) =>
        set((s) => {
          const sess = s.sessions[sessionId];
          if (!sess) return s;
          return {
            sessions: patchSession(s.sessions, sessionId, {
              turns: sess.turns.map((t) =>
                t.kind === 'agent' && t.id === turnId ? { ...t, diff } : t,
              ),
            }),
          };
        }),
    }),
    {
      name: 'lucid:sessions:v2',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) =>
        ({
          order: state.order,
          activeId: state.activeId,
          sessions: Object.fromEntries(
            Object.entries(state.sessions).map(([id, s]) => [
              id,
              { ...s, turns: dropGhostTurns(s.turns), recElapsed: 0, interim: '' },
            ]),
          ),
        }) as Partial<SessionsStoreShape>,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        for (const id of state.order) {
          const sess = state.sessions[id];
          if (!sess) continue;
          sess.turns = dropGhostTurns(sess.turns);
          sess.state = chipFromHistory(sess.turns);
          sess.recElapsed = 0;
          sess.interim = '';
        }
      },
    },
  ),
);

function patchSession(
  sessions: Record<string, Session>,
  id: string,
  patch: Partial<Session>,
): Record<string, Session> {
  const cur = sessions[id];
  if (!cur) return sessions;
  return { ...sessions, [id]: { ...cur, ...patch } };
}

// ─── selector helpers ────────────────────────────────────

export const useActiveSession = (): Session | null =>
  useSessions((s) => (s.activeId ? s.sessions[s.activeId] ?? null : null));

export const useActiveSessionId = (): string | null =>
  useSessions((s) => s.activeId);

export const useSessionList = (): Session[] =>
  useSessions(useShallow((s) => s.order.map((id) => s.sessions[id]).filter(Boolean)));

export const useLiveCount = (): number =>
  useSessions((s) =>
    s.order.reduce(
      (acc, id) => acc + (s.sessions[id] && s.sessions[id].state !== 'IDLE' ? 1 : 0),
      0,
    ),
  );

export { newId };
