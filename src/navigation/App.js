import { Login, Welcome, Register, RequestDetail, MyRequest, DetailSmartRequest } from "../screens"
import UItab from './UITab'
import { NavigationContainer } from '@react-navigation/native';
import { UserPositionProvider } from '../context/UserPositionContext';
import react from 'react';
import { Alert } from 'react-native'
import messaging from '@react-native-firebase/messaging'
const { createNativeStackNavigator } = require("@react-navigation/native-stack")

const App = (props) => {

  const Stack = createNativeStackNavigator();

  react.useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage);
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.notification.body));
    });
    return unsubscribe;
  }, [])

  return (
    <UserPositionProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="RequestDetail" component={RequestDetail} />
          <Stack.Screen name="MyRequest" component={MyRequest} />
          <Stack.Screen name="UItab" component={UItab} />
          <Stack.Screen name="DetailSmartRequest" component={DetailSmartRequest} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserPositionProvider>
    // <NavigationContainer>
    //   <Stack.Navigator 
    //     initialRouteName= "UItab" 
    //     screenOptions={{
    //       headerShown: false,
    //     }}>
    //     <Stack.Screen name="Welcome" component={Welcome} />
    //     <Stack.Screen name="Register" component={Register} />
    //     <Stack.Screen name="Login" component={Login} />
    //     <Stack.Screen name="UItab" component={UItab} />
    //   </Stack.Navigator>
    // </NavigationContainer>
  )
}

export default App