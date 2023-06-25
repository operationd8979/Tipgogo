import React, { useState, useRef, useEffect, useContext, useCallback, Component } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl, ActivityIndicator } from "react-native"
import { useRoute } from '@react-navigation/native';
import useMap from '../FullMap/FullMap'
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import { StackActions } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { orderByKey } from "firebase/database";
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
import Icon from 'react-native-vector-icons/FontAwesome5'
import { getUserIDByTokken } from '../../service/UserService'
import { formatNumber, sendSMS, phonecall } from '../../utilies'

const getUserByUserID = (userID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userID) {
                const dbRef = ref(firebaseDatabase, `users/${userID}`);
                const dbQuery = query(dbRef);
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                console.log(userID)
                if (snapshotObject) {
                    console.log("User getting OK!", snapshotObject);
                    resolve(snapshotObject);
                }
                resolve(null);
            }
            else {
                console.log("No driver!");
                resolve(null);
            }
        }
        catch (error) {
            console.error('Error getting user:', error);
            resolve(null);
        }
    });
}

const WaitingScreen = () => {
    return (
        <View style={{ alignItems: 'center', marginTop: '50%' }}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{
                color: 'black',
            }}>
                Loading!...</Text>
            <Image source={images.logo} style={{ height: normalize(200), width: normalize(200) }} />
        </View>
    );
};


const RequestDetail = (props) => {

    const { navigation } = props;

    //init
    const route = useRoute();
    const { request } = route.params;
    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

    //constant
    const { primary, inactive, zalert, warning, success } = colors;
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
        address,
        direction,
        accepted,
        timestamp
    } = request;

    //func
    const [modalVisible, setModalVisible] = useState(false);
    const [road, setRoad] = useState("");
    const [boss, setBoss] = useState(null);
    const [time, setTime] = useState(null);
    const [stateDisplay, SetStateDisplay] = useState(1);
    const { distance, duration, endAddress, startAddress, summary } = road;

    useEffect(() => {
        checkLocationPermission();
        getCurrentPosition();
        getDirections().then((direction) => {
            if (direction.smart) {
                let ida = "";
                let idb = "";
                if (direction.smart.index === 1) {
                    ida = requestId;
                    idb = direction.smart.id;
                }
                else {
                    ida = direction.smart.id;
                    idb = requestId;
                }
                navigation.dispatch(StackActions.replace('DetailSmartRequest', { ida: ida, idb: idb }))
                // navigation.navigate('DetailSmartRequest',{ requestID:idIndex });
            }
            else {
                setRoad(direction);
                let time = new Date(direction.timestamp);
                time.setMinutes(time.getMinutes() + Math.ceil(direction.duration / 60));
                setTime(time);
            }
        });
        const userId = requestId.split('-')[0];
        getUserByUserID(userId).then((user) => setBoss(user));
        // const cleanup = () => {
        //     LocationService.stop();
        // };
        // LocationService.start();
        // return cleanup;
    }, [])

    useEffect(() => {
        if (currentLocation) {
            updateCurrentDriver();
        }
    }, [currentLocation])

    const updateCurrentDriver = async () => {
        const userID = await getUserIDByTokken();
        const directionRef = ref(firebaseDatabase, `direction/${userID}/${requestId}`)
        update(directionRef, { currentDriver: currentLocation })
            .then(() => {
                console.log("Update currentDriver successfully!.");
            })
            .catch((error) => {
                console.error("Error updating currentDriver: ", error);
            });
    }

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

    const handlePressPhoneCall = () => {
        if (boss.phone) {
            phonecall(boss.phone);
        }
    }

    const handleSendSMS = () => {
        if (boss.phone && time) {
            sendSMS(boss.phone, `Mình đang trên đường đến. Hẹn gặp lúc ${time.toLocaleTimeString()}`);
        }
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

    return road ? <KeyboardAwareScrollView
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
    >
        <View style={{
            flex: 6,
            paddingHorizontal: split.s4,
            paddingVertical: split.s5,
            backgroundColor: primary,
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{
                    color: "white",
                    fontSize: normalize(18),
                    fontWeight: 'bold',
                    padding: 10,
                }}>Deital Request</Text>
                {/*const {onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled,height} = props*/}
            </View>
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        {currentLocation && road && <FullMap geo1={geo1} geo2={geo2} direction={road} direction2={direction} type={type} request={request} screen="DetailRequest" />}
        {road && type === 2 && <View style={{
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
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: "black",
                    marginStart: normalize(5),
                    position: 'absolute',
                    end: normalize(20)
                }}>{Math.ceil(distance / 10) / 100}km/{Math.ceil(duration / 60)}phút</Text>
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
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 1 ? primary : inactive, marginStart: normalize(5) }}>Pay for it</Text>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: "black",
                    marginStart: normalize(5),
                    position: 'absolute',
                    end: normalize(20)
                }}>{price == 0 ? "FREE" : `${formatNumber(price)} vnd`}</Text>
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
                    }}>Địa chỉ đến: {type === 1 ? endAddress : address} </Text>
                </View>
            </View>
        </View>}
        {road && type === 1 && <View style={{
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
                <Text style={{ fontSize: fontSizes.h4, color: primary, marginStart: normalize(5) }}>On going</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{Math.ceil(distance / 10) / 100}km/{Math.ceil(duration / 60)}phút</Text>
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
                <Text style={{ fontSize: fontSizes.h4, color: primary, marginStart: normalize(5) }}>Hitchhiking</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{Math.ceil(direction.distance / 10) / 100}km/{Math.ceil(direction.duration / 60)}phút</Text>
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
                    <Text style={{ color: 'white', fontWeight: '800' }}>3</Text>
                </Circle>
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 1 ? primary : inactive, marginStart: normalize(5) }}>Get pay</Text>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: "black",
                    marginStart: normalize(5),
                    position: 'absolute',
                    end: normalize(20)
                }}>{price == 0 ? "FREE" : `${formatNumber(price)} vnd`}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
        </View>}
        {request && <View style={{
            //backgroundColor:"green",
            marginVertical: normalize(5),
            marginHorizontal: normalize(20),
            alignItems: 'center',
            flexDirection: 'row',
        }}>
            {type == 2 && <Image source={{ uri: url }} style={{ minHeight: 120, height: "100%", width: 120, borderRadius: 20 }} />}
            <View style={{ marginStart: 10, flex: 1 }}>
                <Text style={{
                    marginTop: normalize(5),
                    color: 'black',
                    alignSelf: 'center',
                    fontSize: fontSizes.h4,
                }}>Title: {name} </Text>
                <Text style={{
                    marginTop: normalize(5),
                    color: 'black',
                    alignSelf: 'center',
                    fontSize: fontSizes.h4,
                }}>Mô tả: {des} </Text>
                {type == 1 && <View style={{
                    borderRadius: 30,
                    borderWidth: 1,
                    padding: normalize(11),
                    margin: 3,
                }}>
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Bắt đầu: {road ? road.startAddress : "==/=="}</Text>
                    <View style={{ height: 1, backgroundColor: 'black', margin: 2 }} />
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Đón tại: {direction.startAddress}</Text>
                    <View style={{ height: 1, backgroundColor: 'black', margin: 2 }} />
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Tới: {direction.endAddress}</Text>
                </View>}
            </View>
        </View>}
        {boss && <View style={{
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
                        source={{ uri: boss.photo || images.uriUserPhoto }}
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
                    }}> {boss.name || boss.email}</Text>
                </View>
                <View style={{
                    flex: 3,
                    flexDirection: "row",
                    alignItems: 'center',
                    marginHorizontal: 5,
                    justifyContent: 'space-between',
                }}>
                    <TouchableOpacity
                        onPress={handlePressPhoneCall}
                        style={{
                            padding: 5
                        }}>
                        <Icon
                            name={'phone'}
                            size={normalize(28)}
                            color={'black'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSendSMS}
                        style={{
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
        <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
        <View style={{
            marginHorizontal: 5,
            marginHorizontal: split.s5,
            marginVertical: split.s5,
            height: normalize(50),
            flexDirection: 'row',
            justifyContent: 'space-around',
            //backgroundColor:"red",
        }}>
            {/*onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled*/}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}>
                <LinearGradient
                    colors={[primary, 'white', success]}
                    style={{
                        height: "80%",
                        width: normalize(270),
                        borderRadius: 13,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'black' }}>QR DONE</Text>
                </LinearGradient>
            </TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {modalVisible && (
                        <View style={styles.container}>
                            <CameraQR
                                requestId={requestId}
                                style={{
                                    height: "85%",
                                    width: "100%",
                                    marginBottom: split.s3,
                                }}
                            />
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Text style={{ color: 'white' }}>QR SCAN</Text>
                            </View>
                            <View style={{ height: 2, backgroundColor: primary, width: "100%" }} />
                        </View>
                    )}
                    <CLButton title="Close CAMERA" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    </KeyboardAwareScrollView> : <WaitingScreen />
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