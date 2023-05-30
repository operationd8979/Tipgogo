import React, { useState, useEffect, useCallback } from 'react';
import { Text, Image, View, ImageBackground, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
//component = function
//create a variable which reference to a function
import i18n from '../../i18n'
import { images, icons, colors, fontSizes } from '../constants'
import { CLButton, UIButton } from '../components'

import { useFocusEffect } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native'

import {
    auth,
    onAuthStateChanged,
    firebaseDatabase,
    ref,
    set,
    update,
} from "../../firebase/firebase"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { check, PERMISSIONS, request } from "react-native-permissions";
import Geolocation from '@react-native-community/geolocation';
import { FlashMessage } from '../ui'
import useMap from './FullMap/FullMap'

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
const getCurrentPositionFromGoogle = () => Geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`[Geolocation]:latitude=${latitude},longitude=${longitude}`);     
            AsyncStorage.setItem('currentLocation', JSON.stringify({ latitude, longitude }));
            console.log("Updated current location to AsyncStorage!");
        },
        error => {
            console.error('Error getting current location:', error);
        },
        //{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
)


function Welcome(props) {

    const {navigation,route} = props
    const {navigate,goBack} = navigation
    const [selectedOption, setSelectedOption] = useState(1);

    const { watchPosition } = useMap();
    
    useEffect(()=>{
        console.log("----useEffect_welcomeScreen running-----")
        checkLocationPermission();
        //getCurrentPositionFromGoogle();
        watchPosition();
        const unsubscribe = onAuthStateChanged(auth, async (responseUser) => {
            if (responseUser) {
                console.log("Auth successfully!");
                let oldToken = await AsyncStorage.getItem("token")
                if(oldToken != responseUser.accessToken){
                    AsyncStorage.setItem("token", responseUser.accessToken).then(()=>{
                        navigation.dispatch(StackActions.replace('UItab'))
                        console.log("Set Token successfully!");  
                    }).catch(()=>{
                        console.log("Error set Token!");  
                    })
                    const userRef = ref(firebaseDatabase, `users/${responseUser.uid}`);
                    update(userRef, { accessToken:responseUser.accessToken })
                        .then(() => {
                            console.log("Update accessToken's user successfully!.");
                        })
                        .catch((error) => {
                            console.error("Error updating accessToken's user: ", error);
                        });          
                }
            }
            else{
                console.log("Authing fail")
            }
        })
        return unsubscribe();
    },[])
    
    //state => when a state is changed => UI is reloaded
    //like getter/setter
    const { background } = images;
    const { primary } = colors;

    const options = [
        {lable: i18n.t('w_item1'),value: 1},
        {lable: i18n.t('w_item2'),value: 2},
        {lable: i18n.t('w_item3'),value: 3},
    ];
    
    

    return <View style={{
        backgroundColor: 'white',
        flex: 100
    }}>
        <ImageBackground
            source={
                background
            } resizeMode='cover'
            style={{
                flex: 100,
            }}>
            <View style={{
                flex: 10,
                //backgroundColor: 'green',
            }}>
                <View style={{
                    flexDirection: 'row',
                    height: 50,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginStart: 10,
                }}>
                    
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h2,
                        fontWeight: 'bold'
                    }}>TipGogo.co</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name={'question-circle'}
                        color={'black'}
                        size={20}
                        style={{
                            marginEnd: 20
                        }}
                    />
                </View>
            </View>
            <View style={{
                flex: 25,
                //backgroundColor: 'blue',
                //justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{
                    marginBottom: 7,
                    color: 'black',
                    fontSize: fontSizes.h4
                }}>{i18n.t('welcome')}</Text>
                <Text style={{
                    marginBottom: 7,
                    color: 'black',
                    fontSize: fontSizes.h3,
                    fontWeight: 'bold'
                }}>TipGoCompany.CO!</Text>
                <Text style={{
                    marginBottom: 7,
                    color: 'black',
                    fontSize: fontSizes.h4
                }}>{i18n.t('w_descripstion')}</Text>
            </View>
            <View style={{
                flex: 40,
                //backgroundColor: 'purple'
            }}>
                {options.map(option =>
                    <UIButton 
                        key={option.value}
                        value={option.value}
                        title={option.lable}
                        isSelected={selectedOption === option.value}
                        onPress={() => {
                            setSelectedOption(option.value)
                            i18n.locale = (option.value == 1? 'en': option.value == 2? 'vi' : 'jp')
                        }}
                        color={"rgba(255,255,255,0.8)"}
                    />)}
            </View>
            <View style={{
                flex: 20,
                //backgroundColor: 'purple'
            }}>
                <CLButton 
                    onPress={()=>{
                        navigate('Login');
                    }}
                    title={i18n.t('login').toUpperCase()} 
                />
                <TouchableOpacity 
                    onPress={()=>{
                        navigate('Register');
                    }}
                    style={{
                        padding:5
                }}>
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h5,
                        alignSelf: 'center',
                    }}>{i18n.t('w_desUnder')}</Text>
                    <Text style={{
                        color: primary,
                        fontSize: fontSizes.h5,
                        alignSelf: 'center',
                        textDecorationLine: 'underline'
                    }}>{i18n.t('register')}</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    </View>
}
export default Welcome

