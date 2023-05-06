import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { enableLatestRenderer } from 'react-native-maps';
import { StyleSheet, View, Text, Button, TouchableOpacity, Image } from 'react-native'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { useEffect, useState, useRef } from 'react';
import { storage, storageRef, uploadBytes, getDownloadURL } from './firebase/firebase';
const RNFS = require('react-native-fs');
import * as storagefb from 'firebase/storage';
import { Buffer } from 'buffer';
import RNFetchBlob from 'rn-fetch-blob';
import { error } from 'console';

async function uploadImage(file) {

  console.log("UPloading!");
  const ref = storageRef(storage, "2077.jpg");

  const uri = "file://"+file;
  const fileData = await fetch(uri);
  const bytes = await fileData.blob();
  
  storagefb.uploadBytes(ref, bytes, { contentType: 'image/jpeg' }).then((snapshot) => {
    console.log("uploaded picture");
    getDownloadURL(snapshot.ref).then((url)=>{
      console.log(url);
    }).catch((error)=>{
      console.error(error);
    })
  }).catch((error) => {
    console.error(error);
  })
}

const checkCameraPermission = async () => {
  const cameraPermission = await Camera.getCameraPermissionStatus();
  if (cameraPermission !== 'authorized') {
    const newPermission = await Camera.requestCameraPermission();
    if (newPermission !== 'authorized') {
      Alert.alert('Camera permission denied');
    }
  }
  else {
  }
}

const Test = () => {

  const handlePressCamera = async () => {
    try {
      // const photo = await camera.current.takeSnapshot({
      //   quality: 85,
      //   skipMetadata: true
      // });
      const photo = await camera.current.takePhoto({});
      console.log(photo);
      ///data/user/0/com.tipgogo/cache/mrousavy7566095890664061440.jpg
      const filePath = "file://" + photo.path;
      const newFilePath = RNFS.ExternalDirectoryPath + "abc.jpg";
      RNFS.copyFile(filePath, newFilePath).then(async () => {
        console.log(`move done!New Path:${filePath} to ${newFilePath}`);
        //const fileData = await RNFS.readFile(newFilePath, 'base64')
        //console.log(fileData)
        //const fileInfo = await RNFS.stat(newFilePath);
        //console.log(fileInfo)
        handleCloseCamera();
        uploadImage(newFilePath);
      }).catch((error) => {
        console.error(error);
      })
    } catch (e) {
      console.error(e)
    }
  };

  const camera = useRef(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const [showCamera, setShowCamera] = useState(false);

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const handleTakePicture = async () => {
    if (!device || !camera) {
      console.log("no picture")
      return;
    }
    else {
      // const picture = await camera.current.takeSnapshot({
      //   quality: 85,
      //   skipMetadata: true
      // });
      const picture = await camera.current.takePhoto({});
      console.log("picture")
    }
  };


  const devices = useCameraDevices('ultra-wide-angle-camera')
  const device = devices.back
  //console.log(device.formats)

  return (
    <View style={{
      justifyContent: 'center',
      //alignItems:'center',
      flex: 1
    }}>
      {!showCamera && (
        <Button title="Open Camera" onPress={handleOpenCamera} />
      )}
      {showCamera && device && (
        <View style={styles.container}>
          <Camera
            ref={camera}
            style={{ height: "80%", width: "100%" }}
            device={device}
            isActive={true}
            preset="medium"
            photo={true}
          />
          <TouchableOpacity onPress={handlePressCamera}>
            <View
              style={{
                borderWidth: 2,
                borderColor: "white",
                height: 50,
                width: 50,
                borderRadius: 30,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                alignSelf: 'center',
              }}
            />
          </TouchableOpacity>
          <View style={{ height: 1, flex: 1 }} />
          {/*<Button title="Close Camera" onPress={handleCloseCamera} />*/}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
})

export default Test