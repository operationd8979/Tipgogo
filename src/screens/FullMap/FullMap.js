import React, { useState, useRef, useEffect, useContext, useCallback } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl } from "react-native"
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import i18n from '../../../i18n'
import styles from './styles'
import { mapStyle } from '../../utilies'
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Dropdown, CLButton } from '../../components'
import { check, PERMISSIONS, request } from "react-native-permissions";
import Geolocation from '@react-native-community/geolocation';
import { FlashMessage } from '../../ui'
import Geocoder from 'react-native-geocoding';
import MapViewDirections from 'react-native-maps-directions';
import AsyncStorage from '@react-native-async-storage/async-storage'
import debounce from 'lodash.debounce';
import { captureRef } from 'react-native-view-shot';



const LATITUDE = 33.7001019
const LONGITUDE = 72.9735978
const LATITUDE_DELTA = 0.0022
const LONGITUDE_DELTA = 0.0021

const useMap = () => {

    const [currentLocation, setCurrentLocation] = useState(null);
    const [pressLocation, setPressLocation] = useState(null);

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

    // const getCurrentPosition = async () => {
    //     if (!currentLocation) {
    //         const storageLocation = await AsyncStorage.getItem('currentLocation');
    //         const location = await JSON.parse(storageLocation);
    //         if (location) {
    //             const latitude = location.latitude;
    //             const longitude = location.longitude;
    //             console.log(`[Storage]:latitude=${latitude},longitude=${longitude}`);
    //             setCurrentLocation({ latitude, longitude });
    //         }
    //         else {
    //             Geolocation.getCurrentPosition(
    //                 position => {
    //                     const latitude = position.coords.latitude;
    //                     const longitude = position.coords.longitude;
    //                     console.log(`[Geolocation]:latitude=${latitude},longitude=${longitude}`);
    //                     setCurrentLocation({ latitude, longitude });
    //                     AsyncStorage.setItem('currentLocation', JSON.stringify({ latitude, longitude }));
    //                     console.log("Updated current location to AsyncStorage!");
    //                     //setAddress(getAddressFromCoordinates(latitude,longitude));
    //                 },
    //                 error => {
    //                     checkLocationPermission();
    //                     //console.error('Error getting current location:', error);
    //                 },
    //                 //{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    //             )
    //         }
    //     }
    // }

    const getCurrentPosition = async () => {
        if (!currentLocation) {
            const storageLocation = await AsyncStorage.getItem('currentLocation');
            const location = await JSON.parse(storageLocation);
            if (location) {
                const latitude = location.latitude;
                const longitude = location.longitude;
                console.log(`[Storage]:latitude=${latitude},longitude=${longitude}`);
                setCurrentLocation({ latitude, longitude });
            }
        }
    }

    const watchPosition = async () => {
        console.log("[WATCHPOSITION RUNNING] ID:");
        console.log(
            Geolocation.watchPosition(
                (position) => {
                    console.log("Ready to update!Current location changed!")
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    console.log(`[Geolocation]:latitude=${latitude},longitude=${longitude}`);
                    setCurrentLocation({ latitude, longitude });
                    AsyncStorage.setItem('currentLocation', JSON.stringify({ latitude, longitude }));
                    console.log("Updated current location to AsyncStorage!");
                },
                (error) => {
                    checkLocationPermission();
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: 10,
                    interval: 8000, //5000
                    fastestInterval: 4000, //2000
                }
            ))
    }

    const FullMap = (props) => {

        //element init map
        let { geo1, geo2, lite, direction, direction2, type, screen, locationFromItem, currentDriver, request } = props;
        const mapRef = useRef(null);

        const [uriMap, setUriMap] = useState(null);
        const takeSnapshot = useCallback(() => {
            if (!mapRef.current) {
                return;
            }
            setTimeout(() => {
                const snapshot = mapRef.current.takeSnapshot({
                    format: 'png', 
                    quality: 0.5, 
                    result: 'file', 
                });
                snapshot.then((uri) => {
                    setUriMap(uri);
                });
            }, 0); // add some timeout delay wait map loading element
        }, [mapRef.current]);

        //element func
        const [isEnabledSmartCal, setIsEnabledSmartCal] = useState(false);

        const calInitialRegion = () => {

            let locationA = currentLocation;
            let locationB = geo2;

            if (currentDriver)
                locationB = currentDriver;
            if (screen === "RequestList")
                locationA = geo1;
            else {
                if (type === 1 && geo1)
                    locationB = geo1;
            }

            const minLat = Math.min(locationA.latitude, locationB.latitude);
            const maxLat = Math.max(locationA.latitude, locationB.latitude);
            const minLng = Math.min(locationA.longitude, locationB.longitude);
            const maxLng = Math.max(locationA.longitude, locationB.longitude);

            // Calculate the center of the bounds
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;

            // Calculate the delta (difference) between the min and max values
            const latDelta = (maxLat - minLat) * 1.5;
            const lngDelta = (maxLng - minLng) * 1.5;

            const initialRegion = {
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            };

            return initialRegion;
        }

        const handleGetCurrentLocation = () => {
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
        };

        useEffect(() => {
            console.log(`__________init map(${screen ? screen : null})__________`);
            if (locationFromItem) {
                setCurrentLocation(locationFromItem);
            }
        }, [])

        return (
            currentLocation && <View style={{
                flex: 30,
                height: normalize(180),
                marginHorizontal: split.s5,
                marginVertical: split.s5,
            }}>
                {uriMap && <Image
                    source={{ uri: uriMap }}
                    style={{
                        ...StyleSheet.absoluteFillObject,
                    }}
                />}
                {!uriMap && <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={{
                        ...StyleSheet.absoluteFillObject,
                    }}
                    customMapStyle={mapStyle.mapRetroStyle}
                    liteMode={lite}
                    zoomControlEnabled={true}
                    rotateEnabled={false}
                    initialRegion={geo2 ? calInitialRegion() : {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.011,
                    }}
                    //onMapReady={lite?takeSnapshot:null}
                >
                    {currentLocation && screen != "RequestList" && <Marker
                        key={1}
                        coordinate={currentLocation}
                        tile={"User"}
                        description={"Current Location of User"}
                    >
                        <Image
                            source={images.markerUrGeo2}
                            style={{ width: 35, height: 35 }} // Thiết lập kích thước của hình ảnh
                        />
                    </Marker>}
                    {(screen != "MyRequestList" || screen != "MyRequest") && geo1 && <Marker
                        key={2}
                        coordinate={geo1}
                        tile={"aim"}
                        description={"Location of aim.geo1"}
                    >
                        <Image
                            source={images.markerPeople}
                            style={{ width: 35, height: 35 }} // Thiết lập kích thước của hình ảnh
                        />
                    </Marker>}
                    {geo2 && <Marker
                        key={3}
                        coordinate={geo2}
                        tile={"aim"}
                        description={"Location of aim.geo2"}
                    >
                        <Image
                            source={(screen == "MyRequest" || screen == "MyRequestList") ? images.markerMyAim : images.markerUrAim}
                            style={{ width: 35, height: 35, }} // Thiết lập kích thước của hình ảnh
                        />
                    </Marker>}
                    {currentDriver && <Marker
                        key={4}
                        coordinate={currentDriver}
                        tile={"aim"}
                        description={"Location of aim.geo2"}
                    >
                        <Image
                            source={images.markerPickup}
                            style={{ width: 35, height: 35, }} // Thiết lập kích thước của hình ảnh
                        />
                    </Marker>}
                    {!lite && direction && <Polyline
                        coordinates={direction.route}
                        strokeColor="#ff0000"
                        strokeWidth={2}
                    />}
                    {!lite && direction2 && <Polyline
                        coordinates={direction2.route}
                        strokeColor={colors.primary}
                        strokeWidth={2}
                    />}
                </MapView>}
                {!lite && <TouchableOpacity
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
                </TouchableOpacity>}
            </View>
        )
    }
    return {
        FullMap,
        currentLocation,
        pressLocation,
        setPressLocation,
        checkLocationPermission,
        getCurrentPosition,
        watchPosition,
    }


}




export default useMap

