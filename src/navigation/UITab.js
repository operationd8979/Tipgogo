import {RequestList,Setting,CreateRequest,Register, MyRequestList,SmartCal} from '../screens'
import {colors, fontSizes, normalize} from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome5'
const { createBottomTabNavigator } = require("@react-navigation/bottom-tabs")
import {StyleSheet,View,Image} from 'react-native'
import LinearGradient from 'react-native-linear-gradient';


const UItab = (props) => {

    const { navigation, route } = props

    const {primary,inactive,success,zalert,warning} = colors
    const Tab = createBottomTabNavigator();
    const screenOptions = ({route})=>({
        headerShown: false,
        headerShown: false,
            tabBarActiveTintColor: route.name == "Create" ? zalert : primary,
            tabBarInactiveTintColor: "black",
            tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 0.3,
                borderTopColor: primary,
                height: 65,
                paddingBottom: 6,
            },
            tabBarLabelStyle : route.name == "Create" ? {fontSize:fontSizes.h4,fontWeight:'bold'} :{fontSize:fontSizes.h5},
            tabBarIcon: ({focused})=>{
                let screenName = route.name
                let iconName = route.name == "Requests"? "motorcycle" : route.name == "Create" ? "feather" : route.name == "Setting" ? "user" 
                    : route.name == "SmartDi" ? "broom" : "newspaper"
                return route.name == "Create"? <LinearGradient colors={focused? ['pink', primary] :[primary, 'pink']} style={styles.gradientBackground}>
                    <Icon name={iconName} size={35} color={focused? zalert :'black'} style={{marginBottom:15}}/>
                </LinearGradient> :<Icon name={iconName} size={30} color={focused?primary:inactive}/>
            }
    }) 

    /*
    const screenOptions2 = ({route})=>({
        headerShown: false,
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
                let iconName = route.name == "Requests"? "motorcycle" : route.name == "CreateRequest" ? "feather" : route.name == "Setting" ? "user" : ""
                return <Icon name={iconName} size={30} color={focused?primary:inactive}/>
            }
    }) */

    return (
    <Tab.Navigator 
        initialRouteName= "SmartCal"
        screenOptions={screenOptions}
    >
        <Tab.Screen name="Requests" component={RequestList} />
        <Tab.Screen name="YRR" component={MyRequestList} />
        <Tab.Screen name="Create" component={CreateRequest} />
        <Tab.Screen name="SmartDi" component={SmartCal} />
        <Tab.Screen name="Setting" component={Setting} />
    </Tab.Navigator>);
}

const styles = StyleSheet.create({
    gradientBackground: {
      marginBottom: -7,
      width: normalize(80),
      height: normalize(80),
      borderRadius: 60,
      borderWidth: 5, 
      borderColor: 'black', 
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default UItab