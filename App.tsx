import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootStack } from '@/navigation/RootStack';
import { navTheme } from '@/navigation/theme';
import { colors } from '@/theme/tokens';

/**
 * App root.
 *
 * The "native interaction" the web version faked with pointer math is now real:
 * `@react-navigation/native-stack` renders platform navigators, so the Android
 * system back gesture (and Android 14 predictive back) + iOS swipe-back are
 * provided by the OS — there is no custom gesture code anywhere in the app.
 * (native-stack gets its gestures from react-native-screens; it does not need
 * react-native-gesture-handler, so that dependency isn't included.)
 *
 * Fullscreen / edge-to-edge: a translucent status bar over the dark canvas;
 * screens use `useSafeAreaInsets()` to stay clear of the real notch + home
 * indicator. No simulated chrome.
 */
export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgDeep }}>
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <NavigationContainer theme={navTheme}>
          <RootStack />
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}
