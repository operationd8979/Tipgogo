const { createBottomTabNavigator } = require("@react-navigation/bottom-tabs")
import {RequestList,Setting} from '../screens'
import {colors, fontSizes} from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome5'

const UItab = (props) => {
    const {primary,inactive,success,alert,warning} = colors
    const Tab = createBottomTabNavigator();
    const screenOptions = ({route})=>({
        headerShown: false,
        
    }) 
    return <Tab.Navigator screenOptions={({route})=>({
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.3,
            borderTopColor: primary,
            height:55,
        },
        tabBarLabelStyle : {fontSize:fontSizes.h5},
        tabBarIcon: ({focused})=>{
            let screenName = route.name
            let iconName = route.name == "Requests"? "motorcycle" : route.name == "Setting" ? "user" : ""
            return <Icon name={iconName} size={30} color={focused?primary:inactive}/>
        }
    })}>
        <Tab.Screen name="Requests" component={RequestList} />
        <Tab.Screen name="Setting" component={Setting} />
    </Tab.Navigator>
}

export default UItab