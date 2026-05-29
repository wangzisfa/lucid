import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthProvider = 'google' | 'github' | 'apple' | 'email' | 'guest';

export interface Identity {
  name: string;
  email: string;
  initials: string;
  provider: AuthProvider;
}

/** Mock identity returned by a "successful" handshake — see auth flow (17–23). */
export function mockIdentity(provider: AuthProvider): Identity {
  if (provider === 'guest') {
    return { name: 'Guest', email: 'guest · 30 min session', initials: 'G', provider };
  }
  return { name: 'Iris Chen', email: 'iris@hey.com', initials: 'IR', provider };
}

interface AuthStore {
  signedIn: boolean;
  identity: Identity | null;
  signIn: (provider: AuthProvider) => void;
  signOut: () => void;
}

/**
 * Authentication state. This is a *mock* — there is no real OAuth yet; the auth
 * screens drive a visual state machine (login → bridge → success) and flip
 * `signedIn` here. Persisted so a relaunch skips the login screen.
 */
export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      signedIn: false,
      identity: null,
      signIn: (provider) => set({ signedIn: true, identity: mockIdentity(provider) }),
      signOut: () => set({ signedIn: false, identity: null }),
    }),
    {
      name: 'lucid:auth:v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
