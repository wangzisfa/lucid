import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ModelId =
  | 'claude-haiku-4'
  | 'claude-sonnet-4.5'
  | 'claude-opus-4.1'
  | 'gpt-5'
  | 'gemini-2.5'
  | 'qwen-32b';

export type ContextWindow = 50_000 | 200_000 | 1_000_000;
export const CONTEXT_OPTIONS: ContextWindow[] = [50_000, 200_000, 1_000_000];

export type Thinking = 'off' | 'think' | 'think-hard' | 'think-harder';
export const THINKING_OPTIONS: Thinking[] = ['off', 'think', 'think-hard', 'think-harder'];

export type ProviderId =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'openrouter'
  | 'ollama'
  | 'lucid-cloud';

export type SttId = 'whisper-v3' | 'apple' | 'android';
export type Hotkey = 'hold-mic' | 'tap-twice';

export interface SettingsShape {
  agent: {
    model: ModelId;
    contextWindow: ContextWindow;
    thinking: Thinking;
    temperature: number;
    verifyBeforeShip: boolean;
    autoApprove: boolean;
    allowShellExec: boolean;
    systemPrompt: string;
  };
  providers: {
    active: ProviderId;
    anthropicKey: string;
    openaiKey: string;
    googleKey: string;
    ollamaUrl: string;
    /** Base URL of the deployed Lucid agent server. Required on mobile. */
    serverUrl: string;
    fallback: 'lucid-cloud' | 'none';
    onDeviceOnly: boolean;
  };
  voice: {
    stt: SttId;
    hotkey: Hotkey;
    vad: number;
  };
  ui: {
    theme: 'lucid-terminal';
    density: 'compact' | 'roomy';
    scanlines: boolean;
    auroraAccent: string;
  };
}

export const defaults: SettingsShape = {
  agent: {
    model: 'claude-sonnet-4.5',
    contextWindow: 200_000,
    thinking: 'think-hard',
    temperature: 0.3,
    verifyBeforeShip: true,
    autoApprove: false,
    allowShellExec: true,
    systemPrompt:
      '# persona.md\nYou are Lucid. Build with care.\nSpeak short. Show, don\'t tell.\nVerify before shipping.',
  },
  providers: {
    active: 'anthropic',
    anthropicKey: '',
    openaiKey: '',
    googleKey: '',
    ollamaUrl: 'localhost:11434',
    serverUrl: '',
    fallback: 'lucid-cloud',
    onDeviceOnly: true,
  },
  voice: {
    stt: 'whisper-v3',
    hotkey: 'hold-mic',
    vad: 0.4,
  },
  ui: {
    theme: 'lucid-terminal',
    density: 'compact',
    scanlines: true,
    auroraAccent: '#FF6B9D',
  },
};

interface SettingsStore extends SettingsShape {
  setAgent: <K extends keyof SettingsShape['agent']>(
    key: K,
    value: SettingsShape['agent'][K],
  ) => void;
  setProviders: <K extends keyof SettingsShape['providers']>(
    key: K,
    value: SettingsShape['providers'][K],
  ) => void;
  setVoice: <K extends keyof SettingsShape['voice']>(
    key: K,
    value: SettingsShape['voice'][K],
  ) => void;
  setUi: <K extends keyof SettingsShape['ui']>(
    key: K,
    value: SettingsShape['ui'][K],
  ) => void;
  replace: (next: SettingsShape) => void;
  reset: () => void;
}

const STORAGE_KEY = 'lucid:settings:v2';

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      setAgent: (key, value) => set((s) => ({ agent: { ...s.agent, [key]: value } })),
      setProviders: (key, value) =>
        set((s) => ({ providers: { ...s.providers, [key]: value } })),
      setVoice: (key, value) => set((s) => ({ voice: { ...s.voice, [key]: value } })),
      setUi: (key, value) => set((s) => ({ ui: { ...s.ui, [key]: value } })),
      replace: (next) => set({ ...next }),
      reset: () => set({ ...defaults }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        agent: s.agent,
        providers: s.providers,
        voice: s.voice,
        ui: s.ui,
      }),
    },
  ),
);

export function pickSettings(s: SettingsStore): SettingsShape {
  return { agent: s.agent, providers: s.providers, voice: s.voice, ui: s.ui };
}

/** Mask a long key into `sk-ant-···k29x` style. */
export function maskKey(k: string): string {
  if (!k) return '';
  if (k.length <= 12) return k;
  return `${k.slice(0, 7)}···${k.slice(-4)}`;
}
