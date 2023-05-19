import { Login, Welcome, Register,RequestDetail, MyRequest } from "../screens"
import { NavigationContainer } from '@react-navigation/native';


import UItab from "./UITab";
const { createNativeStackNavigator } = require("@react-navigation/native-stack")

import { UserPositionProvider } from '../context/UserPositionContext';

const App = (props) => {
  const Stack = createNativeStackNavigator();
  return (
    <UserPositionProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="UItab"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="RequestDetail" component={RequestDetail} />
          <Stack.Screen name="MyRequest" component={MyRequest} />
          <Stack.Screen name="UItab" component={UItab} />
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