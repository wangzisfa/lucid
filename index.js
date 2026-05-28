/**
 * Bare React Native entry point. `react-native-gesture-handler` must be the
 * very first import so its native handler is installed before anything renders.
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
