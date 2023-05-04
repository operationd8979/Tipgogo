/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/navigation/App';
import {name as appName} from './app.json';
import {Setting,RequestList,CreateRequest} from './src/screens'
import Test from './test';
import {Camera,useCameraDevices} from 'react-native-vision-camera'

AppRegistry.registerComponent(appName, () => Test);
