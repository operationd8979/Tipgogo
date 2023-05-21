import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useCameraDevices } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';

import {
    auth,
    firebaseDatabase,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    ref,
    get,
    set,
    orderByChild,
    uploadBytes,
    getDownloadURL,
    storageRef,
    storage,
    app,
    onValue,
    child,
    equalTo,
    query,
    update,
} from "../../../firebase/firebase"

import { useNavigation } from '@react-navigation/native';

export default function CameraQR({requestId}) {

    const devices = useCameraDevices();
    const device = devices.back;
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
        checkInverted: true,
    });

    const navigation = useNavigation()

    // Alternatively you can use the underlying function:
    //
    // const frameProcessor = useFrameProcessor((frame) => {
    //   'worklet';
    //   const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE], { checkInverted: true });
    //   runOnJS(setBarcodes)(detectedBarcodes);
    // }, []);

    React.useEffect(()=>{
        if(barcodes[0]){
            if(barcodes[0].content.data==requestId){
                console.log("Key good");
                doneRequest(requestId);
            }
            else{
                console.log("Key wrong!!");
            }
        }
            
    },[barcodes[0]])

    const doneRequest = (requestID) => {
        console.log("Run Completing request!");
        return new Promise(async (resolve, reject) => {
            try {
                const requestRef = ref(firebaseDatabase, `request/${requestID}`);
                update(requestRef, { requestStatus: -1 })
                    .then(() => {
                        console.log("Update data complete request successfully!");
                        navigation.navigate("UItab")
                    })
                    .catch((error) => {
                        console.error("Error Update data complete request: ", error);
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