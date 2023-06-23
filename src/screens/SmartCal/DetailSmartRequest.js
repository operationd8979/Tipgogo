import React, { useState, useRef, useEffect, useContext, useCallback, Component } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl, ActivityIndicator } from "react-native"
import { useRoute } from '@react-navigation/native';
import useMap from '../FullMap/FullMap'
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import { StackActions } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { orderByKey } from "firebase/database";
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polyline } from 'react-native-maps';
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
import { formatNumber, mapStyle, phonecall, sendSMS } from '../../utilies'

const getUserByUserID = (userID) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (userID) {
                const dbRef = ref(firebaseDatabase, 'users');
                const dbQuery = query(dbRef, orderByKey(), equalTo(userID));
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                console.log(userID)
                if (snapshotObject) {
                    const data = snapshotObject[userID];
                    const user = {
                        userID: userID,
                        email: data.email,
                        name: data.name,
                        photo: data.photo,
                        phone: data.phone,
                    }
                    console.log("User getting OK!", user);
                    resolve(user);
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

const DetailSmartRequest = ({ route }) => {

    const mapRef = useRef(null);
    const { ida, idb } = route.params;
    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

    //constant
    const { primary, inactive, zalert, warning, success } = colors;

    //func
    const [modalVisible, setModalVisible] = useState(false);
    const [request1, setRequest1] = useState(null);
    const [request2, setRequest2] = useState(null);
    const [road1, setRoad1] = useState("");
    const [road2, setRoad2] = useState("");
    const [road3, setRoad3] = useState("");
    const [boss1, setBoss1] = useState(null);
    const [boss2, setBoss2] = useState(null);
    const [isEnableDetail1, setIsEnableDetail1] = useState(false);
    const [isEnableDetail2, setIsEnableDetail2] = useState(false);
    const [stateDisplay, SetStateDisplay] = useState(1);
    const [time1, setTime1] = useState(null);
    const [time2, setTime2] = useState(null);
    //const { distance, duration, endAddress, startAddress, summary } = road;

    const handleGetReady = useCallback(() => road1 && road2 && road3 && request1 && request2 && boss1 && boss2 && currentLocation
        , [road1, road2, road3, request1, request2, boss1, boss2, currentLocation])

    useEffect(() => {
        checkLocationPermission();
        getCurrentPosition();
        const dbRef = ref(firebaseDatabase, `request/${ida}`)
        const unsubscribe = onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('Listenning this request[1]........');
                let snapshotObject = snapshot.val();
                setRequest1(snapshotObject);
                if(snapshotObject.requestStatus===1){
                    setModalVisible(false);
                    SetStateDisplay(3);
                }
                else{
                    SetStateDisplay(1);
                }
            } else {
                console.log('Can not get this request!')
            }
        })
        // getRequest(ida).then((request) => {
        //     setRequest1(request);
        // });
        getRequest(idb).then((request) => {
            setRequest2(request);
        });
        getDirection(ida).then((direction) => {
            setRoad1(direction)
            let time = new Date(direction.timestamp);
            time.setMinutes(time.getMinutes() + Math.ceil(direction.duration / 60));
            setTime1(time);
        });
        getDirection(idb).then((direction) => {
            setRoad2(direction)
            let time = new Date(direction.timestamp);
            time.setMinutes(time.getMinutes() + Math.ceil(direction.duration / 60));
            setTime2(time);
        });
        getDirection(`${ida}-${idb}`).then((direction) => {
            setRoad3(direction)
        });
        const userId1 = ida.split('-')[0];
        getUserByUserID(userId1).then((user) => setBoss1(user));
        const userId2 = ida.split('-')[0];
        getUserByUserID(userId2).then((user) => setBoss2(user));
        // const cleanup = () => {
        //     LocationService.stop();
        // };
        // LocationService.start();
        // return cleanup;
        return unsubscribe;
    }, [])

    useEffect(() => {
        if (currentLocation) {
            updateCurrentDriver(ida);
            updateCurrentDriver(idb);
        }
    }, [currentLocation])


    const updateCurrentDriver = async (requestId) => {
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

    const getRequest = (requestId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dbRef = ref(firebaseDatabase, `request/${requestId}`)
                //const dbQuery = query(dbRef, orderByKey(), equalTo(requestId));
                const dbQuery = query(dbRef);
                const data = await get(dbQuery);
                const snapshotObject = data.val();
                resolve(snapshotObject);
            }
            catch (error) {
                console.error('Error getting direction:', error);
                resolve(null);
            }
        });
    }

    const getDirection = (requestId) => {
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

    const handlePressPhoneCall = (boss)=>{
        if(boss.phone){
            phonecall(boss.phone);
        }
    }

    const handleSendSMS = (boss,time)=>{
        if(boss.phone&&time){
            sendSMS(boss.phone,`Mình đang trên đường đến. Hẹn gặp lúc ${time.toLocaleTimeString()}`);
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

    return handleGetReady() ? <KeyboardAwareScrollView
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
        <View style={{
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
                }}>Total amount: {formatNumber(request1.price+request2.price)}đ</Text>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Icon
                    name={'shipping-fast'}
                    size={normalize(12)}
                    color={inactive}
                />
                <Text style={{
                    color: 'black',
                    position: 'relative',
                    marginStart: 2,
                }}>Cost: {Math.ceil((road1.distance+road2.distance)/10)/100}km/{Math.ceil((road1.duration+road2.duration)/60)}phút</Text>
            </View>
        </View>
        {currentLocation && <View style={{
            flex: 30,
            height: normalize(320),
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
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.011,
                }}
            >
                <Marker
                    key={1}
                    coordinate={currentLocation}
                    tile={"User"}
                    description={"Current Location of User"}
                >
                    <Image
                        source={images.markerUrGeo2}
                        style={{ width: 35, height: 35 }} // Thiết lập kích thước của hình ảnh
                    />
                </Marker>
                <Marker
                    key={2}
                    coordinate={request1.geo1}
                    tile={"aim"}
                    description={"Location of aim.geo1[1]"}
                >
                    <Image
                        // source={images.markerPeople}
                        source={images.markerPeople}
                        style={{ width: 35, height: 35 }} // Thiết lập kích thước của hình ảnh
                    />
                </Marker>
                <Marker
                    key={3}
                    coordinate={request1.geo2}
                    tile={"aim"}
                    description={"Location of aim.geo2[1]"}
                >
                    <Image
                        source={images.markerUrAim}
                        style={{ width: 35, height: 35, }} // Thiết lập kích thước của hình ảnh
                    />
                </Marker>
                <Marker
                    key={4}
                    coordinate={request2.geo1}
                    tile={"aim"}
                    description={"Location of aim.geo1[2]"}
                >
                    <Image
                        // source={images.markerPeople}
                        source={images.markerPeople}
                        style={{ width: 35, height: 35 }} // Thiết lập kích thước của hình ảnh
                    />
                </Marker>
                <Marker
                    key={5}
                    coordinate={request2.geo2}
                    tile={"aim"}
                    description={"Location of aim.geo2[2]"}
                >
                    <Image
                        source={images.markerUrAim}
                        style={{ width: 35, height: 35, }} // Thiết lập kích thước của hình ảnh
                    />
                </Marker>
                <Marker
                    key={6}
                    coordinate={road3.route[road3.route.length - 1]}
                    tile={"aim"}
                    description={"Location of aim.geo2[2]"}
                >
                    <Image
                        source={images.markerMyAim}
                        style={{ width: 35, height: 35, }} // Thiết lập kích thước của hình ảnh
                    />
                </Marker>
                {request1 && <Polyline
                    coordinates={request1.direction.route}
                    strokeColor="#ff0000"
                    strokeWidth={2}
                />}
                {request2 && <Polyline
                    coordinates={request2.direction.route}
                    strokeColor="#ff0000"
                    strokeWidth={2}
                />}
                {road1 && <Polyline
                    coordinates={road1.route}
                    strokeColor={primary}
                    strokeWidth={2}
                />}
                {road2 && <Polyline
                    coordinates={road2.route}
                    strokeColor={primary}
                    strokeWidth={2}
                />}
                {road3 && <Polyline
                    coordinates={road3.route}
                    strokeColor={primary}
                    strokeWidth={2}
                />}
            </MapView>
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: split.s2,
                    right: split.s4,
                    borderRadius: 5,
                    marginTop: normalize(40),
                    //backgroundColor:'red'
                }}
                onPress={handleGetCurrentLocation}
            >
                <Image source={images.iconCurrentLocation} style={{ height: 50, width: 50 }} />
            </TouchableOpacity>
        </View>}
        {request1 && request2 && <View style={{
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
                <Text style={{ fontSize: fontSizes.h4, color: primary, marginStart: normalize(5) }}>Hitchhiking 1</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{Math.ceil(request1.direction.distance / 10) / 100}km/{Math.ceil(request1.direction.duration / 60)}phút</Text>
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
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 1 ? primary : inactive, marginStart: normalize(5) }}>Get pay 1</Text>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: "black",
                    marginStart: normalize(5),
                    position: 'absolute',
                    end: normalize(20)
                }}>{request1.price == 0 ? "FREE" : `${formatNumber(request1.price)} vnd`}</Text>
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
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 2 ? primary : inactive, marginStart: normalize(5) }}>Hitchhiking 2</Text>
                <Text style={{ fontSize: fontSizes.h4, color: "black", marginStart: normalize(5), position: 'absolute', end: normalize(20) }}>{Math.ceil(request2.direction.distance / 10) / 100}km/{Math.ceil(request2.direction.duration / 60)}phút</Text>
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: normalize(10),
                marginHorizontal: normalize(20),
            }}>
                <Circle
                    color={stateDisplay > 3 ? primary : inactive}
                    size={30}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>4</Text>
                </Circle>
                <Text style={{ fontSize: fontSizes.h4, color: stateDisplay > 3 ? primary : inactive, marginStart: normalize(5) }}>Get pay 2</Text>
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: "black",
                    marginStart: normalize(5),
                    position: 'absolute',
                    end: normalize(20)
                }}>{request2.price == 0 ? "FREE" : `${formatNumber(request2.price)} vnd`}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary, marginHorizontal: normalize(50) }} />
        </View>}
        {request1 && <View style={{
            //backgroundColor:"green",
            marginVertical: normalize(5),
            marginHorizontal: normalize(5),
        }}>
            <View style={{
                borderRadius: 30,
                borderWidth: 1,
                padding: normalize(11),
                margin: 3,
                backgroundColor: 'white',
            }}>
                {boss1 && <View style={{
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
                                source={{ uri: boss1.photo || images.uriUserPhoto }}
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
                            }}> {boss1.name || boss1.email}</Text>
                        </View>
                        <View style={{
                            flex: 3,
                            flexDirection: "row",
                            alignItems: 'center',
                            marginHorizontal: 5,
                            justifyContent: 'space-between',
                        }}>
                            <TouchableOpacity 
                                onPress={() => handlePressPhoneCall(boss1)}
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
                                onPress={()=>{
                                    if(time1)
                                        handleSendSMS(boss1,time1);
                                }}
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
                {!isEnableDetail1 && <View>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        alignSelf: 'center',
                        fontSize: fontSizes.h4,
                    }}>Title: {request1.title} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        alignSelf: 'center',
                        fontSize: fontSizes.h4,
                    }}>Mô tả: {request1.des} </Text>
                    <TouchableOpacity
                        onPress={() => setIsEnableDetail1(!isEnableDetail1)}
                        style={{
                            alignItems: 'center',
                            //backgroundColor:'green',
                            padding: 2,
                        }}>
                        <Text style={{
                            fontSize: fontSizes.h4,
                            color: success
                        }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
                    </TouchableOpacity>
                </View>}
                {isEnableDetail1 && <View>
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Bắt đầu: {road1 ? road1.startAddress : "==/=="}</Text>
                    <View style={{ height: 1, backgroundColor: 'black', margin: 2 }} />
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Đón tại: {request1.direction.startAddress}</Text>
                    <View style={{ height: 1, backgroundColor: 'black', margin: 2 }} />
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Tới: {request1.direction.endAddress}</Text>
                    <TouchableOpacity
                        onPress={() => setIsEnableDetail1(!isEnableDetail1)}
                        style={{
                            alignItems: 'center',
                            //backgroundColor:'green',
                            padding: 2,
                        }}>
                        <Text style={{
                            fontSize: fontSizes.h4,
                            color: success
                        }}><Icon name="hand-point-right" size={17} /> Close</Text>
                    </TouchableOpacity>
                </View>}
            </View>
        </View>}
        {request2 && <View style={{
            //backgroundColor:"green",
            marginVertical: normalize(5),
            marginHorizontal: normalize(5),
        }}>
            <View style={{
                borderRadius: 30,
                borderWidth: 1,
                padding: normalize(11),
                margin: 3,
                backgroundColor: 'white',
            }}>
                {boss2 && <View style={{
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
                                source={{ uri: boss2.photo || images.uriUserPhoto }}
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
                            }}> {boss2.name || boss2.email}</Text>
                        </View>
                        <View style={{
                            flex: 3,
                            flexDirection: "row",
                            alignItems: 'center',
                            marginHorizontal: 5,
                            justifyContent: 'space-between',
                        }}>
                            <TouchableOpacity 
                                onPress={() => handlePressPhoneCall(boss2)}
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
                                onPress={()=>{
                                    if(time2)
                                        handleSendSMS(boss2,time2);
                                }}
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
                {!isEnableDetail2 && <View>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        alignSelf: 'center',
                        fontSize: fontSizes.h4,
                    }}>Title: {request2.title} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        alignSelf: 'center',
                        fontSize: fontSizes.h4,
                    }}>Mô tả: {request2.des} </Text>
                    <TouchableOpacity
                        onPress={() => setIsEnableDetail2(!isEnableDetail2)}
                        style={{
                            alignItems: 'center',
                            //backgroundColor:'green',
                            padding: 2,
                        }}>
                        <Text style={{
                            fontSize: fontSizes.h4,
                            color: success
                        }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
                    </TouchableOpacity>
                </View>}
                {isEnableDetail2 && <View>
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Bắt đầu: {road2 ? road2.startAddress : "==/=="}</Text>
                    <View style={{ height: 1, backgroundColor: 'black', margin: 2 }} />
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Đón tại: {request2.direction.startAddress}</Text>
                    <View style={{ height: 1, backgroundColor: 'black', margin: 2 }} />
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h4,
                        fontWeight: 'bold'
                    }}>Tới: {request2.direction.endAddress}</Text>
                    <TouchableOpacity
                        onPress={() => setIsEnableDetail2(!isEnableDetail2)}
                        style={{
                            alignItems: 'center',
                            //backgroundColor:'green',
                            padding: 2,
                        }}>
                        <Text style={{
                            fontSize: fontSizes.h4,
                            color: success
                        }}><Icon name="hand-point-right" size={17} /> Close</Text>
                    </TouchableOpacity>
                </View>}
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
                                requestIdLite={request1.requestId}
                                requestId={request2.requestId}
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

export default DetailSmartRequest;