import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useCameraDevices } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import {
    firebaseDatabase,
    ref,
    get,
    orderByChild,
    equalTo,
    query,
    update,
} from "../../../firebase/firebase"
import { useNavigation } from '@react-navigation/native';
import {checkCameraPermission} from '../../service/CameraService'
import {getUserIDByTokken} from '../../service/UserService'

export default function CameraQR({requestId,requestIdLite}) {

    //const
    const devices = useCameraDevices();
    const device = devices.back;
    const navigation = useNavigation();
    //func
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
        checkInverted: true,
    });

    React.useEffect(()=>{
        checkCameraPermission();
        if(barcodes[0]){
            if(barcodes[0].content.data==requestIdLite){
                console.log("Key good");
                doneRequestLite(requestId);
            }
            else{
                console.log("Key wrong!!");
            }
            if(barcodes[0].content.data==requestId){
                console.log("Key good");
                doneRequest(requestId);
            }
            else{
                console.log("Key wrong!!");
            }
        }
            
    },[barcodes[0]])

    const doneRequestLite = (requestID) => {
        console.log("Run Completing request!");
        return new Promise(async (resolve, reject) => {
            try {
                const userID = await getUserIDByTokken();
                const requestRef = ref(firebaseDatabase, `request/${requestID}`);
                const timestamp = (new Date()).getTime();
                update(requestRef, { driver: {driverID: userID, timeend:timestamp} })
                .then(() => {
                    console.log("Update user complete request successfully!");
                })
                .catch((error) => {
                    console.error("Error Update user complete request: ", error);
                });
                update(requestRef, { requestStatus: 1 })
                    .then(() => {
                        console.log("Update status complete request successfully!");
                    })
                    .catch((error) => {
                        console.error("Error Update status complete request: ", error);
                    });
                const directionRef = ref(firebaseDatabase, `direction/${userID}/${requestId}`)
                update(directionRef, { state: 1 })
                    .then(() => {
                        console.log("Update data complete direction successfully!");
                    })
                    .catch((error) => {
                        console.error("Error Update data complete direction: ", error);
                    });
            } catch (error) {
                console.error('Error Completing request:', error);
                reject(new Error('Error Completing request:'));
            }
        });
    };

    const doneRequest = (requestID) => {
        console.log("Run Completing request!");
        return new Promise(async (resolve, reject) => {
            try {
                const userID = await getUserIDByTokken();
                const requestRef = ref(firebaseDatabase, `request/${requestID}`);
                const timestamp = (new Date()).getTime();
                update(requestRef, { driver: {driverID: userID, timeend:timestamp} })
                .then(() => {
                    console.log("Update user complete request successfully!");
                })
                .catch((error) => {
                    console.error("Error Update user complete request: ", error);
                });
                update(requestRef, { requestStatus: 1 })
                    .then(() => {
                        console.log("Update status complete request successfully!");
                    })
                    .catch((error) => {
                        console.error("Error Update status complete request: ", error);
                    });
                const directionRef = ref(firebaseDatabase, `direction/${userID}/${requestId}`)
                update(directionRef, { state: 1 })
                    .then(() => {
                        console.log("Update data complete direction successfully!");
                        navigation.navigate("UItab")
                    })
                    .catch((error) => {
                        console.error("Error Update data complete direction: ", error);
                    });
            } catch (error) {
                console.error('Error Completing request:', error);
                reject(new Error('Error Completing request:'));
            }
        });
    };


    return (
        device != null && (
            <>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    frameProcessor={frameProcessor}
                    frameProcessorFps={5}
                />
                {barcodes.map((barcode, idx) => (
                    <Text key={idx} style={styles.barcodeTextURL}>
                        {barcode.displayValue}
                    </Text>
                ))}
            </>
        )
    );
}

const styles = StyleSheet.create({
    barcodeTextURL: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
});