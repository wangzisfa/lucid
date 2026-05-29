import { useCallback, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useSessions } from './store';

/**
 * Native speech-recognition module, loaded lazily. We `require` it inside a
 * try/catch so the JS bundle still runs if the native side isn't present (e.g.
 * a build without the module linked) — in that case we fall back to a timer +
 * canned transcript, exactly like the web build did when the browser lacked the
 * Web Speech API. This keeps the plan/approve/run loop reachable everywhere.
 */
interface VoiceModule {
  start: (locale: string) => Promise<void>;
  stop: () => Promise<void>;
  destroy: () => Promise<void>;
  removeAllListeners: () => void;
  onSpeechResults?: (e: { value?: string[] }) => void;
  onSpeechPartialResults?: (e: { value?: string[] }) => void;
  onSpeechError?: (e: unknown) => void;
}

function loadVoice(): VoiceModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-voice/voice');
    return (mod.default ?? mod) as VoiceModule;
  } catch {
    return null;
  }
}

const FALLBACK_TRANSCRIPT =
  'add reflection card at 9pm with a soft chime, show tonight’s moon phase quietly in the corner';

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone',
        message: 'Lucid needs the mic to capture your voice turn.',
        buttonPositive: 'Allow',
      },
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Press-and-hold voice capture, scoped to the *active session at start time*.
 * Uses `@react-native-voice/voice` for on-device STT when available; otherwise
 * a timer-only fallback fills a demo transcript on release. The target session
 * id is captured on `start()` and held for the recording's lifetime, so
 * switching sessions mid-record doesn't redirect the transcript.
 */
export function useVoice() {
  const voiceRef = useRef<VoiceModule | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);
  const finalText = useRef('');
  const targetSessionId = useRef<string | null>(null);
  const live = useRef(false);

  useEffect(() => {
    const v = loadVoice();
    voiceRef.current = v;
    if (!v) return;
    v.onSpeechPartialResults = (e) => {
      const t = e.value?.[0] ?? '';
      const id = targetSessionId.current;
      if (!id || !t) return;
      const elapsed = (Date.now() - startedAt.current) / 1000;
      useSessions.getState().updateRecording(id, elapsed, t.trim());
    };
    v.onSpeechResults = (e) => {
      const t = e.value?.[0] ?? '';
      if (t) finalText.current = t.trim();
    };
    v.onSpeechError = () => {
      // permission/availability errors fall through to the timer fallback
    };
    return () => {
      try { v.destroy().then(() => v.removeAllListeners()); } catch { /* noop */ }
    };
  }, []);

  const start = useCallback(() => {
    const activeId = useSessions.getState().activeId;
    if (!activeId) return;
    targetSessionId.current = activeId;
    finalText.current = '';
    startedAt.current = Date.now();
    live.current = true;
    useSessions.getState().beginRecording(activeId);

    tickRef.current = setInterval(() => {
      const id = targetSessionId.current;
      if (!id) return;
      const session = useSessions.getState().sessions[id];
      if (!session) return;
      const elapsed = (Date.now() - startedAt.current) / 1000;
      useSessions.getState().updateRecording(id, elapsed, session.interim);
    }, 100);

    const v = voiceRef.current;
    if (v) {
      ensureMicPermission().then((ok) => {
        if (ok && live.current) {
          v.start('en-US').catch(() => { /* fall back to timer */ });
        }
      });
    }
  }, []);

  const cleanup = () => {
    live.current = false;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    const v = voiceRef.current;
    if (v) { try { v.stop(); } catch { /* noop */ } }
  };

  const stop = useCallback(() => {
    const id = targetSessionId.current;
    if (!id) return;
    const store = useSessions.getState();
    const session = store.sessions[id];
    const elapsed = (Date.now() - startedAt.current) / 1000;
    cleanup();
    if (!session || session.state !== 'REC') {
      targetSessionId.current = null;
      return;
    }
    if (elapsed < 0.35) {
      store.cancelRecording(id); // tap, not hold
      targetSessionId.current = null;
      return;
    }
    const transcript =
      finalText.current.length > 0
        ? finalText.current
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
