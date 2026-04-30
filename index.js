/**
 * @format
 */

// Fire Usercentrics configure()+status() BEFORE any heavy imports.
// The network call overlaps with bundle eval — saves ~600-1500ms on first launch.
import './src/InitializationFlow/consent/earlyUsercentrics';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
