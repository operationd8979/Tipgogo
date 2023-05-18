import React, { useState, useRef, useEffect, useContext, useCallback, Component } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl } from "react-native"
import { useRoute } from '@react-navigation/native';
import useMap from '../FullMap/FullMap'
import { useEvent } from 'react-native-reanimated';
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { orderByKey } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage'
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
import { CameraQR } from '../../screens'
import { CLButton } from '../../components'
import LinearGradient from 'react-native-linear-gradient'



const getUserIDByTokken = async () => {
    const accessToken = await AsyncStorage.getItem('token');
    const dbRef = ref(firebaseDatabase, "users");
    const dbQuery = query(dbRef, orderByChild("accessToken"), equalTo(accessToken));
    const data = await get(dbQuery);
    const userID = Object.keys(data.val())[0];
    return userID;
}

const RequestDetail = (props) => {

    const route = useRoute();

    const { request } = route.params;

    const { primary, inactive, zalert, warning, success } = colors;
    const [modalVisible, setModalVisible] = useState(false);

    const {
        requestId,
        name,
        url,
        status,
        price,
        type,
        des,
        geo1,
        geo2,
        direction,
        accepted,
        timestamp
    } = request;

    const [road, setRoad] = useState("");


    const { distance, duration, endAddress, startAddress, summary } = road;


    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

    useEffect(() => {
        checkLocationPermission();
        getCurrentPosition();
        getDirections().then((direction) => setRoad(direction));
    }, [])

    const getDirections = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const userID = await getUserIDByTokken();
                const dbRef = ref(firebaseDatabase, `direction/${userID}`);
                const dbQuery = query(dbRef, orderByKey(), equalTo(requestId));
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                const direction = snapshotObject[requestId];
                resolve(direction);
            }
            catch (error) {
                console.error('Error getting direction:', error);
                resolve(null);
            }
        });
    }

    const Circle = ({ children, color, size, style }) => {
        return (
            <View
                style={[
                    {
                        backgroundColor: color,
                        borderRadius: size / 2,
                        width: size,
                        height: size,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    style
                ]}>
                {children}
            </View>
        )
    }

    return <KeyboardAwareScrollView
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
    >
        {currentLocation && road && <FullMap geo1={geo1} geo2={geo2} direction={road} type={type} request={request} screen="DetailRequest" />}
        {road && <View style={{
            //backgroundColor:"green",
            //height: 400,
            margin: normalize(10),
        }}>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={primary}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>1</Text>
                </Circle>
                <Text style={{ fontSize: fontSizes.h4, color: primary, marginStart: normalize(5) }}>Pick up your item</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{distance.text}/{duration.text}</Text>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={primary}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>2</Text>
                </Circle>
                <Text style={{ fontSize: fontSizes.h4, color: primary, marginStart: normalize(5) }}>Pay for it</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{price}k vnd</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
            <View style={{
                //backgroundColor:"green",
                margin: normalize(5),
                alignItems: 'center',
            }}>
                <Text style={{ fontSize: fontSizes.h3, color: primary }}>Detail request</Text>
                <View>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Địa chỉ của bạn: {startAddress} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Địa chỉ đến: {endAddress} </Text>
                </View>
            </View>
        </View>}
        {request&&<View style={{
                //backgroundColor:"green",
                marginVertical: normalize(5),
                marginHorizontal: normalize(20),
                alignItems: 'center',
                flexDirection:'row',
            }}>
                <Image source={{uri:url}} style={{minHeight:120,height:"100%",width:120,borderRadius:20}}/>
                <View style={{marginStart:10,flex:1}}>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Tựa: {name} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Mô tả: {des} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Giá: {price} </Text>
                </View>
            </View>}
        <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
        <View style={{
            marginHorizontal: 5,
            marginHorizontal: split.s5,
            marginVertical: split.s5,
            height: normalize(70),
            flexDirection:'row',
            justifyContent: 'space-around',
            //backgroundColor:"red",
        }}>
            {/*onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled*/}
            <TouchableOpacity 
                onPress={() => setModalVisible(true)}>
                    <LinearGradient 
                        colors={[primary, 'white', success]} 
                        style={{
                            height:"100%",
                            width: 110,
                            borderRadius:20,
                            justifyContent:'center',
                            alignItems:'center'
                        }}
                    >
                        <Text style={{color:'black'}}>QR done</Text>
                    </LinearGradient>
            </TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {modalVisible && (
                        <View style={styles.container}>
                            <CameraQR
                                style={{
                                    height: "85%",
                                    width: "100%",
                                    marginBottom: split.s3,
                                }}
                            />
                        </View>
                    )}
                    <CLButton title="Close Modal" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
        <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
        <View style={{ height: 150 }}></View>
    </KeyboardAwareScrollView>
}

const styles = StyleSheet.create({
    container: {
        height: normalize(300),
        width: "90%",
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignSelf: 'center',
        padding: split.s4,
        borderWidth: 1,
        borderColor: 'black',
        marginTop: 20,
    },
});

export default RequestDetail;