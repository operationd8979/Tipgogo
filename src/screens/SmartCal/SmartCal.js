import React, { useState, useEffect, useCallback, useRef } from "react";
import { Alert,Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList, Modal, StyleSheet, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
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
import useMap from '../FullMap/FullMap'
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Credentials from '../../../Credentials'
import { distanceTwoGeo } from '../../utilies'
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { mapStyle,findShortestPaths } from '../../utilies'
import Openrouteservice from 'openrouteservice-js'
const orsDirections = new Openrouteservice.Directions({ api_key: Credentials.APIKey_OpenRouteService });
const Geocode = new Openrouteservice.Geocode({ api_key: Credentials.APIKey_OpenRouteService })
import {getAddressFromLocation,getRouteDirection} from '../../service/MapService'
import {getUserIDByTokken} from '../../service/UserService'


const WaitingScreen = () => {
    return (
        <View style={{ alignItems: 'center', marginTop: '50%' }}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{
                color: 'black',
            }}>
                Waiting for location...</Text>
            <Image source={images.logo} style={{ height: normalize(200), width: normalize(200) }} />
        </View>
    );
};

const WaitingOnProcess = () => {
    return (
        <View style={{ alignItems: 'center', marginTop: '50%' }}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{
                color: 'black',
            }}>
                You on request, do it first!...</Text>
            <Image source={images.logo} style={{ height: normalize(200), width: normalize(200) }} />
        </View>
    );
};

const SmartCal = (props) => {

    const mapRef = useRef(null);

    //constant
    const { primary, zalert, success, warning, inactive } = colors
    const [currentRoute, setCurrentRoute] = useState(null);
    const {
        currentLocation,
        pressLocation,
        setPressLocation,
        checkLocationPermission,
        getCurrentPosition,
    } = useMap();
    //element init
    const { navigation } = props

    //element function
    const [isLoading, setIsLoading] = useState(false)
    const [onAvaiable, setOnAvaiable] = useState(false);
    const [requests, setRequests] = useState([]);
    const [start_address, setStart_address] = useState(null);
    const [end_address, setEnd_address] = useState(null);
    const [time, setTime] = useState(null);


    useEffect(() => {
        console.log("__________Init SmartDirection__________");
        checkLocationPermission();
        getCurrentPosition();
    }, [])

    const Inbounds = (currentLocation, destination, geo1, geo2) => {
        const minLat = Math.min(currentLocation.latitude, destination.latitude);
        const maxLat = Math.max(currentLocation.latitude, destination.latitude);
        const minLong = Math.min(currentLocation.longitude, destination.longitude);
        const maxLong = Math.max(currentLocation.longitude, destination.longitude);
        return (
            geo1.latitude >= minLat &&
            geo1.latitude <= maxLat &&
            geo1.longitude >= minLong &&
            geo1.longitude <= maxLong &&
            geo2.latitude >= minLat &&
            geo2.latitude <= maxLat &&
            geo2.longitude >= minLong &&
            geo2.longitude <= maxLong &&
            distanceTwoGeo(geo1, currentLocation) < distanceTwoGeo(geo2, currentLocation)
        );
    };

    useEffect(() => {
        if (currentLocation) {
            const dbRef = ref(firebaseDatabase, 'request')
            onValue(dbRef, async (snapshot) => {
                if (snapshot.exists()) {
                    console.log('Importing data to listRequest')
                    setOnAvaiable(true);
                    const userID = await getUserIDByTokken();
                    let snapshotObject = snapshot.val()
                    setRequests(Object.keys(snapshotObject)
                        .filter(k => k.split('-')[0] != userID
                            //&& inside(currentLocation,destination,snapshotObject[k].geo1,snapshotObject[k].geo2)
                        )
                        .map(eachKey => {
                            let eachObject = snapshotObject[eachKey]
                            const time = new Date(eachObject.timestamp).toLocaleString();
                            if (userID == eachObject.requestStatus) setOnAvaiable(false);
                            return {
                                requestId: eachKey,
                                name: eachObject.title,
                                url: eachObject.photo,
                                status: eachObject.requestStatus,
                                price: eachObject.price,
                                type: eachObject.typeRequest,
                                des: eachObject.des,
                                geo1: eachObject.geo1,
                                geo2: eachObject.geo2,
                                direction: eachObject.direction,
                                accepted: userID == eachObject.requestStatus,
                                timestamp: eachObject.timestamp,
                                time: time,
                            }
                        }))
                } else {
                    console.log('No data available')
                    setOnAvaiable(true);
                }
            })
        }
    }, [currentLocation])

    const handleMapPress = (event) => {
        if (!isLoading) {
            const { coordinate } = event.nativeEvent;
            setPressLocation(coordinate);
        }
    };

    const handleGetCurrentLocation = () => {
        if (!isLoading) {
            setPressLocation(null);
            if (currentLocation) {
                const { latitude, longitude } = currentLocation;
                const region = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                };
                mapRef.current.animateToRegion(region, 1000);
            }
        }
    };

    const handlePressInitCurrentRoute = async () => {
        if(currentRoute){
            if(currentRoute.destination==pressLocation){
                console.log("No different pressLocation!");
                return;
            }
        }
        if (currentLocation && pressLocation) {
            try{
                const direction = await getRouteDirection(currentLocation, pressLocation);
                const time = new Date(direction.timestamp);
                setTime(time);
                setCurrentRoute(direction);
            }catch(error){
                console.log(error);
            } 
        }
        else {
            console.log("PressLocation is null!");
        }
    }
    const handleSmartDirection = async () => {
        if (requests) {
            const requestInside = requests.filter(r=>r.status==0 && Inbounds(currentLocation,pressLocation,r.geo1,r.geo2));
            if(requestInside.length>2){
                const result = findShortestPaths(currentLocation,requestInside,pressLocation);
                if(result){
                    console.log(result);
                    //currentLocation
                    //result[0].geo1 result[0].geo2 
                    //result[1].geo1 result[1].geo2
                    //pressLocation
                    //currentLocation->result[0].geo1
                    //result[0].geo2->result[1].geo1
                    //result[1].geo2->pressLocation
                }
                else{
                    console.log("Fail smart direction!");
                }
            }
            else{
                return Alert.alert(
                    "Unlucky",
                    "No request on your way!",
                    [
                      {
                        text: "OK",
                      },
                    ]
                  );
            }
        }
        else {
            console.log("Requests is null!");
        }
    }
    


    return currentLocation ?
        onAvaiable ?
            <View style={{
                backgroundColor: 'white',
                flex: 1
            }}>
                <View>
                    <View style={{
                        paddingHorizontal: split.s4,
                        paddingVertical: split.s5,
                        backgroundColor: primary,
                    }}>
                        <Text style={{
                            color: "white",
                            fontSize: normalize(18),
                            fontWeight: 'bold',
                            padding: 10,
                        }}>Smart Direction</Text>
                    </View>
                </View>
               {currentRoute&&<View style={{
                    borderRadius: 30,
                    backgroundColor: 'white',
                    width: '80%',
                    alignItems: 'center',
                    alignSelf: 'center',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Icon
                            name={'clock'}
                            size={normalize(12)}
                            color={inactive}
                        />
                        <Text style={{
                            color: 'black',
                            position: 'relative',
                            marginStart: 2,
                        }}>Thời gian: {Math.ceil(currentRoute.duration/60)} phút</Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Icon
                            name={'clock'}
                            size={normalize(12)}
                            color={inactive}
                        />
                        <Text style={{
                            color: 'black',
                            position: 'relative',
                            marginStart: 2,
                        }}>Khoảng cách: {Math.ceil(currentRoute.distance/100)/10} km</Text>
                    </View>
                    <Text style={{
                        color: 'black',
                        position: 'relative',

                    }}>Địa chỉ hiện tại: {currentRoute.startAddress}</Text>
                    <Text style={{
                        color: 'black',
                        position: 'relative',
                    }}>Địa chỉ tới: {currentRoute.endAddress}</Text>
                </View>}
                {currentLocation && <View style={{
                    flex: 30,
                    height: normalize(420),
                    marginHorizontal: split.s5,
                    marginVertical: split.s5,
                }}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={{
                            ...StyleSheet.absoluteFillObject,
                        }}
                        customMapStyle={mapStyle.mapRetroStyle}
                        zoomControlEnabled={true}
                        rotateEnabled={false}
                        initialRegion={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                            latitudeDelta: 0.008,
                            longitudeDelta: 0.011,
                        }}
                        onPress={(event)=>{
                            if (currentRoute) {
                                return Alert.alert(
                                    "Current Route is aviable",
                                    "Are you sure you want change your route?",
                                    [
                                        {
                                            text: "Yes",
                                            onPress:() => {
                                                setCurrentRoute(null);
                                            },
                                        },
                                        {
                                            text: "No",
                                        },
                                    ]
                                );
                            }
                            else{
                                handleMapPress(event);
                            }
                        }}
                    >
                        <Marker
                            key={1}
                            coordinate={currentLocation}
                            tile={"User"}
                            description={"Current User Location"}
                        >
                            <Image
                                source={images.markerUrGeo2}
                                style={{ width: 35, height: 35, }}
                            />
                        </Marker>
                        {pressLocation && <Marker
                            key={2}
                            coordinate={pressLocation}
                            tile={"Destination"}
                            description={"Destination Location"}
                        >
                            <Image
                                source={images.markerUrGeo1}
                                style={{ width: 35, height: 35, }}
                            />
                        </Marker>}
                        {currentRoute && <Polyline
                            coordinates={currentRoute.route}
                            strokeColor={colors.primary}
                            strokeWidth={2}
                        />}
                    </MapView>
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: split.s2,
                            right: split.s4,
                            borderRadius: 5,
                        }}
                        onPress={handleGetCurrentLocation}
                    >
                        <Image source={images.iconCurrentLocation} style={{ height: 50, width: 50 }} />
                    </TouchableOpacity>
                </View>}
                <TouchableOpacity
                    onPress={() => {
                        handlePressInitCurrentRoute();
                    }}
                    disabled={!pressLocation}
                    style={{
                        borderColor: primary,
                        borderWidth: 1,
                        height:  45,
                        width: '90%',
                        borderRadius: 30,
                        marginHorizontal: 14,
                        marginVertical: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        backgroundColor: pressLocation?primary:inactive,
                    }}>
                    <Text style={{
                        fontSize: fontSizes.h3,
                        color:'white',
                    }}>Cập nhật đường đi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        handleSmartDirection();
                    }}
                    disabled={!currentRoute}
                    style={{
                        borderColor: primary,
                        borderWidth: 1,
                        height:  45,
                        width: '90%',
                        borderRadius: 30,
                        marginHorizontal: 14,
                        marginVertical: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        backgroundColor: currentRoute?primary:inactive,
                    }}>
                    <Text style={{
                        fontSize: fontSizes.h3,
                        color:'white',
                    }}>Smart Direction</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        console.log(requests.filter(r=>r.status==0 
                            && inside(currentLocation,pressLocation,r.geo1,r.geo2)))
                        //         requestId: eachKey,
                        //         name: eachObject.title,
                        //         url: eachObject.photo,
                        //         status: eachObject.requestStatus,
                        //         price: eachObject.price,
                        //         type: eachObject.typeRequest,
                        //         des: eachObject.des,
                        //         geo1: eachObject.geo1,
                        //         geo2: eachObject.geo2,
                        //         direction: eachObject.direction,
                        //         accepted: userID == eachObject.requestStatus,
                        //         timestamp: eachObject.timestamp,
                        //         time: time,
                    }}
                    style={{
                        borderColor: primary,
                        borderWidth: 1,
                        height:  45,
                        width: '90%',
                        borderRadius: 30,
                        marginHorizontal: 14,
                        marginVertical: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        backgroundColor: primary,
                    }}>
                    <Text style={{
                        fontSize: fontSizes.h3,
                        color:'white',
                    }}> console</Text>
                </TouchableOpacity>
                <View style={{height:50}}/>
            </View> : <WaitingOnProcess /> : <WaitingScreen />
}


const styles = StyleSheet.create({
    container: {
        height: normalize(340),
        width: "90%",
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignSelf: 'center',
        padding: split.s4,
        borderWidth: 1,
        borderColor: 'black',
    },
});
export default SmartCal