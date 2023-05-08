import React, { useState, useRef, useEffect, useContext, useCallback } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl } from "react-native"
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
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

const useMap = () => {

    const mapRef = useRef(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [geo1, setGeo1] = useState(null);
    const [geo2, setGeo2] = useState(null);
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
    const getCurrentPosition = () => Geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`latitude=${latitude}`);
            console.log(`longitude=${longitude}`);
            setCurrentLocation({ latitude, longitude });
        },
        error => {
            console.error('Error getting current location:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
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

    const FullMap = (props) => {

        const {geo1} = props
        console.log(geo1);
        

        return (
            currentLocation && <View style={{
                flex: 30,
                height: normalize(180),
                marginHorizontal: split.s5,
                marginVertical: split.s5,
            }}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={{
                        ...StyleSheet.absoluteFillObject,
                      }}
                    customMapStyle={mapStyle.mapRetroStyle}
                    zoomControlEnabled={true}
                    rotateEnabled={false}
                    //onPress={handleMapPress}
                    initialRegion={{
                        latitude: geo1? geo1.latitude : currentLocation.latitude,
                        longitude: geo1? geo1.longitude : currentLocation.longitude,
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
                    >
                        <Callout tooltip>
                        </Callout>
                    </Marker>

                    <Marker
                        key={2}
                        coordinate={geo1}
                        tile={"geo1"}
                        description={"Location of Geo1"}
                    >
                        <Image
                            source={images.markerPeople}
                            style={{ width: 50, height: 50 }} // Thiết lập kích thước của hình ảnh
                        />
                        <Callout tooltip>
                            <Text>hello</Text>
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
            </View>
        )
    }
    return {
            checkLocationPermission,
            getCurrentPosition,
            FullMap,
            currentLocation,
            setCurrentLocation,
            geo1,
            setGeo1,
            geo2,
            setGeo2,
    }
    

}




export default useMap

