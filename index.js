/**
 * @format
 */
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './src/navigation/App';
import { name as appName } from './app.json';
import { Setting, RequestList, CreateRequest, Login, Welcome, CameraQR } from './src/screens'
import Test from './test';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('tipgogo', () => App);
