import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'


export const requestUserPermission = async () => {
    console.log(messaging);
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
        || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if(enabled){
        getFcmToken();
    }
}

export const getFcmToken = async () =>{
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if(!fcmToken){
        try{
            const token = await messaging().getToken();
            if(token){
                await AsyncStorage.setItem('fcmToken',token);
                console.log(token);
            }
        }catch(error){
            console.log(`Get fcm tokken error:${error}`);
        }
    }
    else{
        console.log(fcmToken);
    }
}

