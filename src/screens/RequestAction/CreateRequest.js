import React, { useState, useRef, useEffect, useContext, useCallback } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl, ActivityIndicator } from "react-native"
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Dimensions } from 'react-native';
import { StackActions } from '@react-navigation/native'
import { Dropdown, CLButton } from '../../components'
import { Picker } from '@react-native-picker/picker'
import { TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
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
} from "../../../firebase/firebase"
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { isEnabled } from "react-native/Libraries/Performance/Systrace";
import { UserPositionContext } from '../../context/UserPositionContext';
import { check, PERMISSIONS, request } from "react-native-permissions";
import Geolocation from '@react-native-community/geolocation';
import { FlashMessage } from '../../ui'
import i18n from '../../../i18n'
import Geocoder from 'react-native-geocoding';
import {mapStyle} from '../../utilies'

const RNFS = require('react-native-fs');

const relatitude = 37.78825
const relongitude = -122.4324
const relatitudeDelta = 0.015
const relongitudeDelta = 0.0121

Geocoder.init("google map tokken");

const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0].formatted_address;
      return address;
    } catch (error) {
      console.error('Lỗi:', error);
      return null;
    }
  };

const checkCameraPermission = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    if (cameraPermission !== 'authorized') {
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission !== 'authorized') {
            FlashMessage({
                message:
                    'Tap on this message to open Settings then allow app to use camera from permissions.',
                onPress: async () => {
                    await Linking.openSettings()
                }
            })
        }
    }
    else {
        console.log("Camera already use!")
    }
}

const checkLocationPermission = async () => {
    try {
        const granted = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (granted === 'granted') {
            console.log("Location is enabled");
        } else {
            const permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            if (permissionStatus === 'granted') {
                console.log("Location is enabled");
            } else {
                FlashMessage({
                    message:
                        'Tap on this message to open Settings then allow app to use location from permissions.',
                    onPress: async () => {
                        await Linking.openSettings()
                    }
                })
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const CreateRequest = () => {

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            getCurrentPosition();
            setPhotoPath(null);
            setPhotoUri(null);
            setTypeRequest(1);
            setTitle("");
            setPrice(null);
            setTitleAmount("Pay");
            setIsEnabledFree(false);
            setDes("");
            setRefreshing(false);
        }, 1500);
    }, []);

    const mapRef = useRef(null);
    //prop's const
    const { primary, zalert, warning, success, inactive } = colors
    const { userPosition, updateUserPosition } = useContext(UserPositionContext);

    //request's const
    const [photoUri, setPhotoUri] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [typeRequest, setTypeRequest] = useState(1);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(null);
    const [des, setDes] = useState("");
    const [address, setAddress] = useState("");
    //error const request
    const [errorPhotoUri, setErrorPhotoUri] = useState(null);
    const [errorCurrentLocation, setErrorCurrentLocation] = useState(null);
    const [errorTypeRequest, setErrorTypeRequest] = useState(null);
    const [errorTitle, setErrorTitle] = useState(null);
    const [errorPrice, setErrorPrice] = useState(null);
    const [errorDes, setErrorDes] = useState(null);

    //function's const
    const [photoPath, setPhotoPath] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const camera = useRef(null);
    const devices = useCameraDevices('ultra-wide-angle-camera')
    const device = devices.back
    const [titleAmount, setTitleAmount] = useState("Pay");
    const [isEnabledFree, setIsEnabledFree] = useState(false);
    const [selected, setSelected] = useState(false);
    const [showIndicator,setShowIndicator] = useState(false)

    const data = [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
        { label: 'Four', value: '4' },
        { label: 'Five', value: '5' },
    ];

    useEffect(() => {
        console.log('------------Init------------');
        console.log('Check camera permission');
        checkCameraPermission();
    }, [])

    useEffect(() => {
        checkLocationPermission()
        getCurrentPosition();
        
    }, [])

    const getCurrentPosition = () => Geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`latitude=${latitude}`);
            console.log(`longitude=${longitude}`);
            setCurrentLocation({ latitude, longitude });
            //setAddress(getAddressFromCoordinates(latitude,longitude));
        },
        error => {
            console.error('Error getting current location:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )

    const handlePressCamera = async () => {
        console.log('------------Press camera------------');
        try {
            const photo = await camera.current.takePhoto({});
            const filePath = "file://" + photo.path;
            const newFilePath = RNFS.ExternalDirectoryPath + `${new Date().getTime()}.jpg`;
            RNFS.copyFile(filePath, newFilePath).then(async () => {
                console.log(`move done!New Path:${filePath} to ${newFilePath}`);
                setModalVisible(false)
                const uri = "file://" + newFilePath;
                setPhotoPath(uri);
            }).catch((error) => {
                console.error(error);
            })
        } catch (e) {
            console.error(e)
        }
    };

    // async function uploadImage(uri) {
    //     const ref = storageRef(storage, `${new Date().getTime()}.jpg`);
    //     const fileData = await fetch(uri);
    //     const bytes = await fileData.blob();
    //     uploadBytes(ref, bytes, { contentType: 'image/jpeg' }).then((snapshot) => {
    //         console.log("uploaded picture");
    //         getDownloadURL(snapshot.ref).then((url) => {
    //             setPhotoUri(url);
    //         }).catch((error) => {
    //             console.error(error);
    //         })
    //     }).catch((error) => {
    //         console.error(error);
    //     })
    // }

    const uploadImage = async (uri) => {
        try {
          const ref = storageRef(storage, `${new Date().getTime()}.jpg`);
          const fileData = await fetch(uri);
          const bytes = await fileData.blob();
          const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
          console.log("Uploaded picture");
      
          const url = await getDownloadURL(snapshot.ref);
          console.log("Download URL:", url);
      
          return url;
        } catch (error) {
          console.error(error);
          return null;
        }
      };


    const handleUpdatePosition = () => {
        const newPosition = { latitude: 123, longitude: 456 };
        updateUserPosition(newPosition);
    };

    const toggleSwitchPrice = () => {
        setIsEnabledFree(previousState => !previousState);
        setTitleAmount(preTitle => preTitle === "Pay" ? "Free" : "Pay");
        setPrice("");
    }

    function validateCredentials() {
        let result = true;
        setErrorTitle(null);
        setErrorPrice(null);
        setErrorDes(null);
        setErrorPhotoUri(null);
        setErrorCurrentLocation(null);
        setErrorTypeRequest(null);
        if (!title) {
            setErrorTitle(i18n.t('titleErr1'))
            result = false;
        }
        if (!price) {
            if(isEnabledFree)
                setPrice("0");
            else{
                setErrorPrice(i18n.t('priceErr1'))
                result = false;
            } 
        }
        if (!des) {
            setErrorDes(i18n.t('desErr1'))
            result = false;
        }
        if (!photoPath) {
            setErrorPhotoUri(i18n.t('photoErr1'))
            result = false;
        }
        if (!currentLocation) {
            setErrorCurrentLocation(i18n.t('locationErr1'))
            result = false;
        }
        // if (!address) {
        //     console.error('address is null!')
        //     result = false;
        // }
        return result
    }

    const handlePostRequest = async () => {
        if (validateCredentials()) {
            console.log('------------Postting request------------');
            setShowIndicator(true);
            const accessToken = await AsyncStorage.getItem('token');
            const dbRef = ref(firebaseDatabase,"users");
            const dbQuery = query(dbRef,orderByChild("accessToken"),equalTo(accessToken));
            const data = await get(dbQuery);
            const userID = Object.keys(data.val())[0];
            
            const uploadedImageUrl = await uploadImage(photoPath);
            if (!uploadedImageUrl) {
                console.error("Image upload failed!");
                return;
            }

            let request = {
                title: title,
                des: des,
                price: price,
                geo1: currentLocation,
                geo2: currentLocation,
                photo:uploadedImageUrl,
                typeRequest: typeRequest,
                // address: address,
                requestStatus: 0,
            }
            set(ref( firebaseDatabase,`request/${userID}-${title}`), request)
                .then(() => {
                    console.log("Data written to Firebase Realtime Database.");
                    onRefresh();
                    setShowIndicator(false);
                })
                .catch((error) => {
                    console.error("Error writing data to Firebase Realtime Database: ", error);
                    setShowIndicator(false);
                });
        }

    }

    const handleMapPress = (event) => {
        const { coordinate } = event.nativeEvent;
        setCurrentLocation(coordinate);
    };

    const handleGetCurrentLocation = () => {
        const { latitude, longitude } = currentLocation;
        const region = {
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        };
        mapRef.current.animateToRegion(region, 1000);
    };


    return (
        <KeyboardAwareScrollView
            enableResetScrollToCoords={true}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{
                flex: 6,
                marginHorizontal: split.s4,
                marginVertical: split.s5,
                //backgroundColor:'red',
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{
                        color: 'black',
                        fontSize: normalize(18),
                        fontWeight: 'bold',
                        padding: 10,
                    }}>Create Request</Text>
                    {/*const {onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled,height} = props*/}
                    <CLButton title={"Re-New"} sizeBT="20%" radius={7} onPress={onRefresh} />
                </View>

                <View style={{ height: 1, backgroundColor: primary }} />
            </View>
            <View style={{
                flex: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red',
            }}>
                <View style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 7,
                    width: 380,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingStart: 10,
                }}>
                    <Text style={{ fontSize: fontSizes.h5, color: "#191970" }}>Danh mục |</Text>
                    <Picker
                        selectedValue={typeRequest}
                        style={{
                            flex: 1,
                            height: 50,
                            color: 'black',
                        }}
                        onValueChange={(itemValue, itemIndex) => setTypeRequest(itemValue)}
                    >
                        <Picker.Item label="Hitchhiking" value={1} />
                        <Picker.Item label="Secondhand Stuff" value={2} />
                        <Picker.Item label="Delivery" value={3} />
                    </Picker>
                </View>
            </View>
            <View style={{
                flex: 8,
                alignItems: 'center',
                flexDirection: 'row',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red'
            }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    position: 'absolute',
                    left: split.s1,
                    color: "black",
                }}>Tiêu đề :</Text>
                <TextInput style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 15,
                    width: 390,
                    paddingStart: "15%",
                    marginHorizontal: 10,
                    color: "black",
                }}
                    value={title}
                    onChangeText={setTitle}
                    autoCorrect={false}
                    placeholder={errorTitle? errorTitle: ""}
                    placeholderTextColor={zalert}
                />
            </View>
            <View style={{
                flex: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red'
            }}>
                <TextInput
                    editable={!isEnabledFree}
                    style={{
                        borderWidth: 1,
                        borderColor: !isEnabledFree ? "black" : success,
                        borderRadius: 15,
                        width: "70%",
                        paddingHorizontal: 10,
                        marginHorizontal: 10,
                        color: "black",
                    }}
                    placeholder={!isEnabledFree ? (errorPrice? errorPrice:"Price") : "0 VND"}
                    value={price}
                    onChangeText={setPrice}
                    autoCorrect={false}
                    placeholderTextColor={!isEnabledFree ? (errorPrice? zalert: inactive) : success}
                />
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: isEnabledFree ? success : zalert,
                }}>{titleAmount}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "green" }}
                    thumbColor={isEnabledFree ? success : "#f4f3f4"}
                    onValueChange={toggleSwitchPrice}
                    value={isEnabledFree}
                    style={{
                        marginEnd: 10,
                        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
                    }}
                />
            </View>
            <View style={{
                flex: 16,
                marginHorizontal: 5,
                flexDirection: 'row',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                height: normalize(70),
                //backgroundColor:"red",
            }}>
                {/*onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled*/}
                <CLButton
                    title="Camera"
                    onPress={() => setModalVisible(true)}
                    sizeBT="25%"
                    height="100%"
                    radius={20}
                    colorBG="#b0e0e6"
                    colorT="#000080"
                />
                {
                    photoPath && <Image
                        style={{
                            width: "20%",
                            height: "80%",
                            alignSelf: "center",
                        }}
                        defaultSource={require('../../assets/helpbuy.jpg')}
                        source={{ uri: "file://" + photoPath }}
                    />
                }
                <Modal visible={modalVisible} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {modalVisible && device && (
                            <View style={styles.container}>
                                <Camera
                                    ref={camera}
                                    style={{
                                        height: "85%",
                                        width: "100%",
                                        marginBottom: split.s3,
                                    }}
                                    device={device}
                                    isActive={true}
                                    preset="medium"
                                    photo={true}
                                />
                                <TouchableOpacity
                                    onPress={handlePressCamera}
                                >
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
                                {/*<Button title="Close Camera" onPress={handleCloseCamera} />*/}
                            </View>
                        )}
                        <CLButton title="Close Modal" onPress={() => setModalVisible(false)} />
                    </View>
                </Modal>
            </View>
            <View style={{
                flex: 30,
                marginHorizontal: 5,
                alignItems: "center",
                height: normalize(120),
                marginHorizontal: split.s5,
                marginVertical: split.s5,
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    position: 'absolute',
                    right: split.s4,
                    top: split.s1,
                    color: "black",
                }}>| Ghi chú |</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        borderColor: !isEnabledFree ? "black" : success,
                        borderRadius: 15,
                        width: "100%",
                        height: "100%",
                        paddingHorizontal: 10,
                        marginHorizontal: 10,
                        color: 'black',
                        paddingEnd: "20%",
                    }}
                    value={des}
                    onChangeText={setDes}
                    autoCorrect={false}
                    multiline={true}
                    placeholder={errorDes? errorDes: ""}
                    placeholderTextColor={zalert}
                />
            </View>
            {currentLocation && <View style={{
                flex: 30,
                height: normalize(180),
                marginHorizontal: split.s5,
                marginVertical: split.s5,
            }}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    customMapStyle={mapStyle.mapRetroStyle}
                    zoomControlEnabled={true}
                    rotateEnabled={false}
                    onPress={handleMapPress}
                    initialRegion={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.011,
                    }}
                //onRegionChange={handleRegionChange}
                >
                    <Marker
                        key={1}
                        coordinate={currentLocation}
                        tile={"User"}
                        description={"Current Location of User"}
                    //image={{uri: 'https://img.freepik.com/premium-vector/red-geolocation-icon_74669-526.jpg'}}
                    >
                        <Callout tooltip>
                        </Callout>
                    </Marker>

                </MapView>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: split.s2,
                        right: split.s4,
                        borderRadius: 5,
                        //backgroundColor:'red'
                    }}
                    onPress={handleGetCurrentLocation}
                >
                    <Image source={images.iconCurrentLocation} style={{ height: 50, width: 50 }} />
                </TouchableOpacity>
            </View>}
            {showIndicator && <ActivityIndicator size={'large'} animating={showIndicator}/>}
            <View style={{
                flex: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: split.s1,
                marginVertical: split.s5,
            }}>
                <CLButton
                    title={"Preview"}
                    colorBG={primary}
                    colorBD={"white"}
                    colorT={"white"}
                    sizeF={fontSizes.h4}
                    sizeBT={130}
                    radius={15}
                    onPress={()=>{
                        console.log();
                    }}
                />
                
                <CLButton
                    title={"Post request"}
                    colorBG={primary}
                    colorBD={"white"}
                    colorT={"white"}
                    sizeF={fontSizes.h4}
                    sizeBT={130}
                    radius={15}
                    onPress={() => {
                        handlePostRequest();
                    }}
                /> 
            </View>
            
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        margin: 20,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        height: 50,
        width: 350,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        marginBottom: 60,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});




export default CreateRequest;

{/* <View>
        {!!selected && (
            <Text>
                Selected: label = {selected.label} and value = {selected.value}
            </Text>
        )}
        <Dropdown label="Select Item" data={data} onSelect={setSelected} />
        <Text>This is the rest of the form.</Text>
    </View> */}
