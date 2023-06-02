import { Alert,Linking } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera'


const checkCameraPermission = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    if (cameraPermission !== 'authorized') {
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission !== 'authorized') {
            return  Alert.alert(
                "Permission camera",
                "Click OK to open Settings then allow app to use camera from permissions.",
                [
                    {
                        text: "OK",
                        onPress:async () => {
                            await Linking.openSettings();
                        }
                    },
                ]
            );
        }
        else {
            console.log("Camera already use!")
        }
    }
    else {
        console.log("Camera already use!")
    }
}


export{
    checkCameraPermission,
}