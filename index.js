/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/navigation/App';
import {name as appName} from './app.json';
import {Setting,RequestList} from './src/screens'
import UItab from './src/navigation/UITab';

AppRegistry.registerComponent(appName, () => App);
