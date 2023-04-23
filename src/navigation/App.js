import {Login,Welcome,FoodList,ProductList,Setting} from "../screens"
import { NavigationContainer } from '@react-navigation/native';
import UItab from "./UITab";
const { createNativeStackNavigator } = require("@react-navigation/native-stack")

const App = (props) => {
  const Stack = createNativeStackNavigator();
  return <NavigationContainer>
    <Stack.Navigator 
      initialRouteName= "Welcome" 
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="UItab" component={UItab} />
    </Stack.Navigator>
  </NavigationContainer>
}

export default App