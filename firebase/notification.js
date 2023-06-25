import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Credentials from '../Credentials'
import axios from 'axios';
const serverKey = Credentials.Server_key;

export const requestUserPermission = async () => {
    // console.log(serverKey);
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
        || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
        getFcmToken();
    }
}

export const getFcmToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
        try {
            const token = await messaging().getToken();
            if (token) {
                await AsyncStorage.setItem('fcmToken', token);
                console.log(`MessagingFirebase get fcmToken ${token}`);
            }
        } catch (error) {
            console.log(`Get fcm tokken error:${error}`);
        }
    }
    else {
        console.log(`AsyncStorage get fcmToken ${fcmToken}`);
    }
}

export const sendNotification = async (token, title, body) => {
    try {
        console.log(serverKey);
        const apiUrl = 'https://fcm.googleapis.com/fcm/send';
        const requestBody = {
            to: token,
            notification: {
                title: title,
                body: body,
            },
        };
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `key=${serverKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (response)
            console.log('Notification sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};



