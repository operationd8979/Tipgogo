import React, { useState, useEffect, useCallback } from 'react';
import { Text, Image, View, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import i18n from '../../i18n'
import { images, icons, colors, fontSizes, normalize } from '../constants'
import { CLButton, UIButton } from '../components'
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
import useMap from './FullMap/FullMap'


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


function Welcome(props) {

    //constant
    const { navigation, route } = props;
    const { navigate, goBack } = navigation;
    const { background } = images;
    const { primary } = colors;
    const options = [
        { lable: i18n.t('w_item1'), value: 1 },
        { lable: i18n.t('w_item2'), value: 2 },
        { lable: i18n.t('w_item3'), value: 3 },
    ];
    //func
    const [selectedOption, setSelectedOption] = useState(1);
    const { watchPosition, checkLocationPermission, currentLocation, setCurrentLocation, getCurrentPositionReal } = useMap();

    useEffect(() => {
        console.log("----useEffect_welcomeScreen running-----")
        checkLocationPermission();
        // getCurrentPositionReal();
        watchPosition();
        const unsubscribe = onAuthStateChanged(auth, async (responseUser) => {
            if (responseUser) {
                console.log("Auth successfully!");
                let oldToken = await AsyncStorage.getItem("token")
                if (oldToken != responseUser.accessToken) {
                    AsyncStorage.setItem("token", responseUser.accessToken).then(() => {
                        navigation.dispatch(StackActions.replace('UItab'))
                        console.log("Set Token successfully!");
                    }).catch(() => {
                        console.log("Error set Token!");
                    })
                    const userRef = ref(firebaseDatabase, `users/${responseUser.uid}`);
                    update(userRef, { accessToken: responseUser.accessToken })
                        .then(() => {
                            console.log("Update accessToken's user successfully!.");
                        })
                        .catch((error) => {
                            console.log("Error updating accessToken's user: ", error);
                        });
                }
            }
            else {
                console.log("Authing fail")
            }
        })
        return unsubscribe();
    }, [])

    return currentLocation ? <View style={{
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
                            i18n.locale = (option.value == 1 ? 'en' : option.value == 2 ? 'vi' : 'jp')
                        }}
                        color={"rgba(255,255,255,0.8)"}
                    />)}
            </View>
            <View style={{
                flex: 20,
                //backgroundColor: 'purple'
            }}>
                <CLButton
                    onPress={() => {
                        navigate('Login');
                    }}
                    title={i18n.t('login').toUpperCase()}
                />
                <TouchableOpacity
                    onPress={() => {
                        navigate('Register');
                    }}
                    style={{
                        padding: 5
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
    </View> : <WaitingScreen />
}
export default Welcome

