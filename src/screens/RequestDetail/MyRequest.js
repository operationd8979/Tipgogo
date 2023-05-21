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
import QRCode from 'react-native-qrcode-svg';
import { State } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/FontAwesome5'

const getUserByUserID = (userID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userID) {
                const dbRef = ref(firebaseDatabase, 'users');
                const dbQuery = query(dbRef, orderByKey(), equalTo(userID));
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                if (snapshotObject) {
                    const data = snapshotObject[userID];
                    const user = {
                        userID: userID,
                        email: data.email,
                        name: data.name,
                        photo: data.photo,
                    }
                    console.log("User getting OK!", user);
                    resolve(user);
                }
                resolve(null);
            }
            else {
                console.log("No driver!");
            }

        }
        catch (error) {
            console.error('Error getting user:', error);
            resolve(null);
        }
    });
}

const RequestDetail = (props) => {

    const { navigation } = props

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

    const timePost = new Date(timestamp);

    const [road, setRoad] = useState(null);
    const [driver, setDriver] = useState(null);
    const [time, setTime] = useState(null);
    const [stateDisplay, SetStateDisplay] = useState(1);
    const [stateRequest, SetStateRequest] = useState(status);

    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

    useEffect(() => {
        checkLocationPermission();
        getCurrentPosition();
        const dbRef = ref(firebaseDatabase, `request/${requestId}`)
        onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('Listenning this request........');
                let snapshotObject = snapshot.val();
                SetStateRequest(snapshotObject.requestStatus);
            } else {
                console.log('Can not get this request!')
            }
        })
        console.log(driver);
    }, [])

    useEffect(() => {
        //bổ xung value on tracking location of driver....
        if(stateRequest==-1){
            navigation.navigate('UItab')
        }
        else{
            if(stateRequest!=0){
                getDirections().then((direction) => {
                    setRoad(direction);
                    if (direction) {
                        const time = new Date(direction.timestamp);
                        setTime(time);
                        SetStateDisplay(2);
                    }
                });
                getUserByUserID(stateRequest).then((user) => setDriver(user));
            }
        }
    }, [stateRequest])


    const getDirections = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const dbRef = ref(firebaseDatabase, `direction/${stateRequest}`);
                const dbQuery = query(dbRef, orderByKey(), equalTo(requestId));
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                if (snapshotObject) {
                    const direction = snapshotObject[requestId];
                    resolve(direction);
                }
                resolve(null);
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
        <View>
            <View style={{
                paddingHorizontal: split.s4,
                paddingVertical: split.s5,
                backgroundColor:primary
            }}>
                <Text style={{
                    color: 'white',
                    fontSize: normalize(18),
                    fontWeight: 'bold',
                    padding: 10,
                }}>Your Request</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        {road && time && <View style={{
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
                }}>Hẹn lúc: {time.getHours()}:{time.getMinutes() + Math.ceil(road.duration.value / 60)} {time.getDate()}/{time.getMonth() + 1}</Text>
            </View>
            <Text style={{
                color: 'black',
                position: 'relative',

            }}>Vị trí tại: {road.endAddress}</Text>
        </View>}
        {currentLocation && <FullMap geo1={geo1} geo2={geo2} type={type} direction2={direction} currentDriver={road ? road.currentDriver : null} request={request} screen="MyRequest" />}
        <View>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(140), marginBottom: 3 }} />
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(146) }} />
            <Text style={{ color: 'black', fontSize: fontSizes.h3, alignSelf: 'center' }}>Yêu cầu đang được xử lý</Text>
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
                <Text style={{ fontSize: fontSizes.h4, color: primary, marginStart: normalize(5) }}>Đã gửi</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{timePost.toLocaleString()}</Text>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={stateDisplay > 1 ? primary : inactive}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>2</Text>
                </Circle>
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 1 ? primary : inactive, marginStart: normalize(5) }}>Nhận yêu cầu</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{time ? time.toLocaleString() : '==/=='}</Text>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={stateDisplay > 2 ? primary : inactive}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>3</Text>
                </Circle>
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 2 ? primary : inactive, marginStart: normalize(5) }}>Hoàn thành</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>==/==</Text>
            </View>
        </View>
        <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50), marginBottom: 2 }} />
        {driver && road && <View style={{
            //backgroundColor:"green",
            //height: 400,
            marginVertical: normalize(5),
            marginHorizontal: normalize(10),
        }}>
            <View style={{
                flexDirection: "row",
                marginVertical: normalize(5),
                borderRadius: 15,
                borderWidth: 1,
                padding: 5,
            }}>
                <View style={{
                    flex: 7,
                    flexDirection: "row",
                    alignItems: 'center',
                    marginHorizontal: 5,
                }}>
                    <Image
                        source={{ uri: driver.photo || images.uriUserPhoto }}
                        style={{
                            width: normalize(40),
                            height: normalize(40),
                            borderRadius: 90,
                        }}
                    />
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: '500',
                        marginStart: 5,
                    }}> {driver.name || driver.email}</Text>
                </View>
                <View style={{
                    flex: 3,
                    flexDirection: "row",
                    alignItems: 'center',
                    marginHorizontal: 5,
                    justifyContent: 'space-between',
                }}>
                    <TouchableOpacity style={{
                        padding: 5
                    }}>
                        <Icon
                            name={'phone'}
                            size={normalize(28)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        padding: 5
                    }}>
                        <Icon
                            name={'rocketchat'}
                            size={normalize(28)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>}
        <View style={{
            //backgroundColor:"green",
            marginVertical: normalize(5),
            marginHorizontal: normalize(10),
            //backgroundColor:'red',
        }}>
            <View style={{
                flexDirection: 'row',
            }}>
                {type==2&&<Image source={{ uri: url }} style={{ minHeight: 120, height: "100%", width: 120, borderRadius: 20 }} />}
                <View style={{ marginStart: 10, flex: 1 }}>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        alignSelf:'center',
                        fontSize: fontSizes.h4,
                    }}>Title: {name} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        alignSelf:'center',
                        fontSize: fontSizes.h4,
                    }}>Mô tả: {des} </Text>
                    {type == 1 && <View style={{
                        borderRadius:30,
                        borderWidth:1,
                        padding: normalize(11),
                        margin:3,
                        alignItems:'center'
                    }}>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Khoảng cách: {direction.distance.text}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Thời gian: {direction.duration.text}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                        fontWeight:'bold'
                                    }}>Từ: {direction.startAddress}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                        fontWeight:'bold'
                                    }}>Tới: {direction.endAddress}</Text>
                                </View>}
                    <Text style={{
                        marginTop: normalize(5),
                        color: price == 0 ? success : 'black',
                        fontSize: fontSizes.h4,
                        alignSelf:'center',
                    }}>Giá: {price == 0 ? "FREE" : `${price}k vnd`} </Text>
                </View>
            </View>
        </View>
        <View style={{ height: 1, backgroundColor: zalert, marginHorizontal: normalize(50), marginBottom: 2 }} />
        <View style={{
            marginHorizontal: 5,
            marginHorizontal: split.s5,
            marginVertical: split.s5,
            height: normalize(70),
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems:'center'
            //backgroundColor:"red",
        }}>
            {/*onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled*/}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}>
                <LinearGradient
                    colors={[primary, 'white', 'navy']}
                    style={{
                        height: "70%",
                        width: normalize(110),
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'black' }}>QR CODE</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                disabled={driver != null}
                onPress={() => console.log('press huy request')}>
                <LinearGradient
                    colors={driver == null ? [zalert, 'white', 'red'] : [inactive, 'white', inactive]}
                    style={{
                        height: "70%",
                        width: normalize(110),
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'black' }}>Hủy yêu cầu</Text>
                </LinearGradient>
            </TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {modalVisible && (
                        <View style={styles.container}>
                            <View style={{
                                flex: 2,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Text style={{ color: 'black' }}>Code:</Text>
                                <Text style={{ color: 'black' }}>{requestId}</Text>
                            </View>
                            <View style={{ height: 2, backgroundColor: primary, width: "90%" }} />
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 8,
                            }}>
                                <QRCode
                                    size={normalize(160)}
                                    value={requestId}
                                />
                            </View>
                        </View>
                    )}
                    <CLButton title="Close Modal" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
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
        alignItems: 'center',
    },
});

export default RequestDetail;