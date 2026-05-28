'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSessions } from './store';

// Browser typing surface for the Web Speech API.
interface SRResultAlt { transcript: string }
interface SRResult   { isFinal: boolean; readonly length: number; [i: number]: SRResultAlt }
interface SREvent    { resultIndex: number; results: { length: number; [i: number]: SRResult } }
interface SR {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
}
type SRCtor = new () => SR;

const getRecognizer = (): SRCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/** Fallback transcript when the browser has no Speech Recognition API. */
const FALLBACK_TRANSCRIPT =
  'add reflection card at 9pm with a soft chime, show tonight’s moon phase quietly in the corner';

/**
 * Press-and-hold voice capture, scoped to the *active session at start time*.
 *
 *   - real STT when the browser supports `SpeechRecognition` /
 *     `webkitSpeechRecognition` (Chrome, Edge, Safari)
 *   - timer-only fallback otherwise; release fills in a demo transcript so the
 *     full plan/approve/run loop is still reachable.
 *
 * The active-session id is captured on `start()` and held for the lifetime of
 * the recording. Switching the active session mid-recording does **not**
 * redirect the in-flight transcript — the turn still lands on whichever
 * session was active when you pressed down.
 */
export function useVoice() {
  const recRef       = useRef<SR | null>(null);
  const tickRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt    = useRef<number>(0);
  const finalText    = useRef<string>('');
  const supportedRef = useRef<boolean>(true);
  /** Session id captured when `start()` fired — recording targets this id. */
  const targetSessionId = useRef<string | null>(null);

  useEffect(() => {
    const Ctor = getRecognizer();
    supportedRef.current = !!Ctor;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let interimText = '';
      let newFinal = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) newFinal += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (newFinal) finalText.current += newFinal;
      const id = targetSessionId.current;
      if (!id) return;
      const elapsed = (performance.now() - startedAt.current) / 1000;
      useSessions.getState().updateRecording(id, elapsed, (finalText.current + interimText).trim());
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        supportedRef.current = false;
      }
    };
    r.onend = () => {};
    recRef.current = r;
    return () => { try { r.abort(); } catch {/* noop */} };
  }, []);

  const start = useCallback((e?: React.PointerEvent) => {
    e?.preventDefault();
    const activeId = useSessions.getState().activeId;
    if (!activeId) return; // nothing to record against
    targetSessionId.current = activeId;
    useSessions.getState().beginRecording(activeId);
    startedAt.current = performance.now();
    finalText.current = '';
    tickRef.current = setInterval(() => {
      const id = targetSessionId.current;
      if (!id) return;
      const session = useSessions.getState().sessions[id];
      if (!session) return;
      const elapsed = (performance.now() - startedAt.current) / 1000;
      useSessions.getState().updateRecording(id, elapsed, session.interim);
    }, 90);
    if (recRef.current && supportedRef.current) {
      try { recRef.current.start(); }
      catch { /* already-started races are harmless */ }
    }
  }, []);

  const cleanup = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    if (recRef.current) {
      try { recRef.current.stop(); } catch {/* noop */}
    }
  };

  const stop = useCallback(() => {
    const id = targetSessionId.current;
    if (!id) return;
    const store = useSessions.getState();
    const session = store.sessions[id];
    if (!session || session.state !== 'REC') {
      targetSessionId.current = null;
      return;
    }
    const elapsed = (performance.now() - startedAt.current) / 1000;
    cleanup();
    if (elapsed < 0.35) {
      // tap, not hold — cancel quietly
      store.cancelRecording(id);
      targetSessionId.current = null;
      return;
    }
    const transcript =
      supportedRef.current && finalText.current.trim().length > 0
        ? finalText.current.trim()
        : (session.interim || FALLBACK_TRANSCRIPT);
    store.finishVoiceTurn(id, transcript, Math.round(elapsed * 10) / 10);
    targetSessionId.current = null;
  }, []);

  const cancel = useCallback(() => {
    const id = targetSessionId.current;
    cleanup();
    if (id) useSessions.getState().cancelRecording(id);
    targetSessionId.current = null;
  }, []);

  return { start, stop, cancel };
}
