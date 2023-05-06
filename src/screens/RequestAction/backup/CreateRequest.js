import React, { useState, useRef, useEffect } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from "react-native"
import { colors, fontSizes, icons, images, normalize } from "../../constants"
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
} from "../../../firebase/firebase"

import { Camera, useCameraDevices } from 'react-native-vision-camera'


import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { isEnabled } from "react-native/Libraries/Performance/Systrace";

const relatitude = 37.78825
const relongitude = -122.4324
const relatitudeDelta = 0.015
const relongitudeDelta = 0.0121

const checkCameraPermission = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    if (cameraPermission !== 'authorized') {
      const newPermission = await Camera.requestCameraPermission();
      if (newPermission !== 'authorized') {
        Alert.alert('Camera permission denied');
      }
    }
    else{
        console.log("Camera already use!")
    }
  }

const CreateRequest = () => {

    useFEffect(()=>{
        console.log("Check camera permission!")
        checkCameraPermission();
    },[modalVisible])

    const camera = useRef(null);

    const devices = useCameraDevices('ultra-wide-angle-camera')
    const device = devices.back

    const [titleAmount, setTitleAmount] = useState("Pay");
    const [isEnabledFree, setIsEnabledFree] = useState(false);
    const toggleSwitchPrice = () => {
        setIsEnabledFree(previousState => !previousState);
        setTitleAmount(preTitle => preTitle === "Pay" ? "Free" : "Pay");
        setPrice("");
    }

    const { primary, zalert, warning, success, inactive } = colors

    const [typeRequest, setTypeRequest] = useState(1);

    const [modalVisible, setModalVisible] = useState(false);

    const [selected, setSelected] = useState(false);

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(null);


    const data = [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
        { label: 'Three', value: '3' },
        { label: 'Four', value: '4' },
        { label: 'Five', value: '5' },
    ];


    const handlePostRequest = async () => {
        const accessToken = await AsyncStorage.getItem('token');
        debugger
        const dbRef = ref(firebaseDatabase);
        get(child(dbRef, `users/${userId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        get(ref('users')
            .orderByChild('accessToken')
            .equalTo(accessToken)
            .once('value'), async (snapshot) => {
                console.log('getted database!')
                userID = Object.keys(snapshot.val())[0];
                email = snapshot.val.email;
            })
        let request = {
            name: email,
            title: title,
            price: price,
            typeRequest: typeRequest,
        }
        set(ref(
            firebaseDatabase,
            `request/${userID}`
        ), request)
            .then(() => {
                console.log("Data written to Firebase Realtime Database.");
            })
            .catch((error) => {
                console.error("Error writing data to Firebase Realtime Database: ", error);
            });
    }

    return (
        <KeyboardAwareScrollView
            enableResetScrollToCoords={true}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <View style={{
                flex: 6,
                marginHorizontal: 5,
                //backgroundColor:'red',
            }}>
                <Text style={{
                    color: 'black',
                    fontSize: normalize(18),
                    fontWeight: 'bold',
                    padding: 10,
                }}>Create Request</Text>
                <View style={{ height: 1, backgroundColor: primary }} />
            </View>
            <View style={{
                flex: 10,
                marginHorizontal: 5,
                justifyContent: 'center',
                alignItems: 'center',
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
                //backgroundColor:'red'
            }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    position: 'absolute',
                    left: 17,
                    color: "black",
                }}>Tiêu đề :</Text>
                <TextInput style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 15,
                    width: 390,
                    paddingStart: 50,
                    marginHorizontal: 10,
                }}
                    value={title}
                    onChangeText={setTitle}
                    autoCorrect={false}
                />
            </View>
            <View style={{
                flex: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
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
                    }}
                    placeholder={!isEnabledFree ? "Price" : "0 VND"}
                    value={price}
                    onChangeText={setPrice}
                    autoCorrect={false}
                    placeholderTextColor={!isEnabledFree ? inactive : success}
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
                marginBottom: "2%",
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
                <Modal visible={modalVisible} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {modalVisible && device && (
                            <View style={styles.container}>
                                <Camera
                                    ref={camera}
                                    style={{ height: 200, width: 200 }}
                                    device={device}
                                    isActive={true}
                                    preset="medium"
                                    photo={true}
                                />
                                <TouchableOpacity >
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
                marginBottom: "2%",
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    position: 'absolute',
                    left: 17,
                    top: 10,
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
                    }}

                    autoCorrect={false}
                    multiline={true}
                />
            </View>
            <View style={{
                flex: 30,
                height: 350,
                marginHorizontal: 5
            }}>
                <MapView
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    customMapStyle={mapStandardStyle}
                    region={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    }}
                >
                    <Marker
                        key={1}
                        coordinate={{
                            latitude: 37.78825,
                            longitude: -122.4324,
                        }}
                        tile={"gà rán"}
                        description={"Shop bán gà rán ngon nhứt nách"}
                    //image={{uri: 'https://img.freepik.com/premium-vector/red-geolocation-icon_74669-526.jpg'}}
                    >
                        <Callout tooltip>
                        </Callout>
                    </Marker>
                </MapView>
                {/* <View>
                    {!!selected && (
                        <Text>
                            Selected: label = {selected.label} and value = {selected.value}
                        </Text>
                    )}
                    <Dropdown label="Select Item" data={data} onSelect={setSelected} />
                    <Text>This is the rest of the form.</Text>
                </View> */}
            </View>
            <View style={{
                flex: 20,
                marginHorizontal: 5,
                flexDirection: 'row',
                justifyContent: 'center'
                //backgroundColor:'red'
            }}>
                <CLButton
                    title={"Preview"}
                    colorBG={primary}
                    colorBD={"white"}
                    colorT={"white"}
                    sizeF={fontSizes.h4}
                    sizeBT={130}
                    radius={15}
                    onPress={{}}
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


const mapDarkStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#181818"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1b1b1b"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#2c2c2c"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8a8a8a"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#373737"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3c3c3c"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#4e4e4e"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3d3d3d"
            }
        ]
    }
];

const mapStandardStyle = [
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
];


export default CreateRequest;