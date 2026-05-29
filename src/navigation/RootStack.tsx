import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/theme/tokens';
import { BootScreen } from '@/screens/BootScreen';
import { ReposScreen } from '@/screens/ReposScreen';
import { SessionScreen } from '@/screens/SessionScreen';
import { AgentsScreen } from '@/screens/AgentsScreen';
import { FilesScreen } from '@/screens/FilesScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { SettingsModel } from '@/screens/SettingsModel';
import { SettingsProviders } from '@/screens/SettingsProviders';
import { SettingsRaw } from '@/screens/SettingsRaw';
import { AccountScreen } from '@/screens/AccountScreen';
import { AuthLogin } from '@/screens/AuthLogin';
import { AuthBridge } from '@/screens/AuthBridge';
import { AuthSuccess } from '@/screens/AuthSuccess';
import { AuthError } from '@/screens/AuthError';
import { AuthSignout } from '@/screens/AuthSignout';
import { AuthReauth } from '@/screens/AuthReauth';
import type { AuthProvider } from '@/lib/auth-store';

/**
 * Route table. Each route is a real native screen, so the platform owns the
 * back gesture:
 *   - Android: system back gesture + predictive back (Android 14+)
 *   - iOS: interactive swipe-back
 *
 * `fullScreenGestureEnabled` makes the iOS swipe-back catch from anywhere on
 * the screen (not just the left edge), matching Android's feel. We never write
 * pointer/gesture code for navigation — that was the web hack we're removing.
 */
export type RootStackParamList = {
  Boot: undefined;
  Repos: undefined;
  Session: { sessionId?: string } | undefined;
  Agents: undefined;
  Files: undefined;
  Settings: undefined;
  SettingsModel: undefined;
  SettingsProviders: undefined;
  SettingsRaw: undefined;
  Account: undefined;
  AuthLogin: undefined;
  AuthBridge: { provider: AuthProvider };
  AuthSuccess: { provider: AuthProvider };
  AuthError: { provider: AuthProvider };
  AuthSignout: undefined;
  AuthReauth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Boot"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgDeep },
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Boot"
        component={BootScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="Repos" component={ReposScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="Agents" component={AgentsScreen} />
      <Stack.Screen name="Files" component={FilesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SettingsModel" component={SettingsModel} />
      <Stack.Screen name="SettingsProviders" component={SettingsProviders} />
      <Stack.Screen name="SettingsRaw" component={SettingsRaw} />
      <Stack.Screen name="Account" component={AccountScreen} />

      <Stack.Screen name="AuthLogin" component={AuthLogin} options={{ animation: 'fade' }} />
      <Stack.Screen name="AuthBridge" component={AuthBridge} options={{ gestureEnabled: false }} />
      <Stack.Screen name="AuthSuccess" component={AuthSuccess} options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="AuthError" component={AuthError} options={{ gestureEnabled: false }} />
      <Stack.Screen name="AuthSignout" component={AuthSignout} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name="AuthReauth" component={AuthReauth} options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack.Navigator>
  );
}
