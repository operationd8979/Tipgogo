import React, { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList, Modal, StyleSheet, ActivityIndicator } from "react-native"
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
import { mapStyle, findShortestPaths, formatNumber } from '../../utilies'
import Openrouteservice from 'openrouteservice-js'
const orsDirections = new Openrouteservice.Directions({ api_key: Credentials.APIKey_OpenRouteService });
const Geocode = new Openrouteservice.Geocode({ api_key: Credentials.APIKey_OpenRouteService })
import { getAddressFromLocation, getRouteDirection, getMatrix, getLocationFromAddress } from '../../service/MapService'
import { getUserIDByTokken } from '../../service/UserService'
import { QuickView, CLButton } from '../../components'


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

    const { primary, zalert, success, warning, inactive } = colors
    const [selectedResult, setSelectedResult] = useState(null);
    const [selectedRequest1, setSelectedRequest1] = useState(null);
    const [selectedRequest2, setSelectedRequest2] = useState(null);
    const [displayRequest1, setDisplayRequest1] = useState(false);
    const [historyPressLocation, setHistoryPressLocation] = useState(null);


    const mapRef = useRef(null);
    const colorTheme = 'white';
    const colorText = 'black';
    const colorIcon = '#5d36bb';

    const [modalVisible, setModalVisible] = useState(false);
    const [hightProfit, setHightProfit] = useState(false);
    const handleCloseRequest = () => {
        setModalVisible(false);
    }
    const acceptRequest = () => {
        console.log("press accept");
    }

    //constant
    const [currentRoute, setCurrentRoute] = useState(null);
    const {
        FullMap,
        currentLocation,
        pressLocation,
        setPressLocation,
        checkLocationPermission,
        getCurrentPosition,
    } = useMap();
    //element init
    const { navigation } = props

    const [searchAddress, setSearchAddress] = useState(null);
    const [displaySearch, setDisplaySearch] = useState(null);

    //element function
    const [isLoading, setIsLoading] = useState(false)
    const [onAvaiable, setOnAvaiable] = useState(false);
    const [requests, setRequests] = useState([]);
    const [start_address, setStart_address] = useState(null);
    const [end_address, setEnd_address] = useState(null);
    const [time, setTime] = useState(null);

    //smartDirection
    const [matrix, setMatrix] = useState(null);
    const [result, setResult] = useState(null);


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
                        .filter(k => snapshotObject[k].requestStatus != -1 && snapshotObject[k].requestStatus != 1)
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

    const filterResult = useCallback(() => result.sort((a, b) => {
        if (hightProfit) {
            return b.hight - a.hight;
        }
        else {
            return a.cost - b.cost;
        }
    }), [result, hightProfit]);

    const handleMapPress = (event) => {
        if (!isLoading) {
            if (currentRoute) {
                setCurrentRoute(null);
            }
            if (displaySearch) {
                setDisplaySearch(null);
                setSearchAddress(null);
            }
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
        if (currentRoute) {
            if (currentRoute.destination == pressLocation) {
                console.log("No different pressLocation!");
                return;
            }
        }
        if (currentLocation && pressLocation) {
            try {
                const direction = await getRouteDirection(currentLocation, pressLocation);
                const time = new Date(direction.timestamp);
                setTime(time);
                setCurrentRoute(direction);
            } catch (error) {
                console.log(error);
            }
        }
        else {
            console.log("PressLocation is null!");
        }
    }

    const handleSearchAddress = async () => {
        setIsLoading(true);
        if (searchAddress) {
            const reponse = await getLocationFromAddress(searchAddress);
            console.log(reponse.data[0])
            if (reponse.data.length > 0) {
                console.log(reponse.data[0].display_name);
                const coordinate = {
                    latitude: parseFloat(reponse.data[0].lat),
                    longitude: parseFloat(reponse.data[0].lon),
                }
                setDisplaySearch(reponse.data[0].display_name);
                setPressLocation(coordinate);
                if (coordinate) {
                    const { latitude, longitude } = coordinate;
                    const region = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    };
                    mapRef.current.animateToRegion(region, 1000);
                }
            }
            else {
                console.log("Get address fail!");
                alert("Không tìm thấy địa điểm phù hợp!");
                setDisplaySearch(null);
                setPressLocation(null);
            }
        }
        else {
            console.log("Search String is not ")
        }
        setIsLoading(false);
    }



    const handleSmartDirection = async () => {
        //lưu history tránh gọi matrix nhiều lần 1 kết quả
        setHistoryPressLocation(pressLocation);
        
        // const testLocation = { latitude: 10.856801472746513, longitude: 106.78506564549127 };
        // const testPressLocation = { latitude: 10.800080072142539, longitude: 106.71194005777636 };
        const aimRequest = requests.filter(r => r.status == 0 && r.type === 1
            && Inbounds(currentLocation, pressLocation, r.geo1, r.geo2));
        //kiểm tra request đã lọc
        const size = aimRequest.length;
        console.log('-----------List aimRequest----------');
        console.log(aimRequest);
        aimRequest.map(r=>console.log(r.name));
        //không đủ request
        if(size<2){
            return Alert.alert(
                "No request is aviable!",
                "There is no claim to match your route!",
                [
                    {
                        text: "OK",
                    },
                ]
            );
        }
        //init locations để get matrix
        let count = 0;
        let locations = [];
        //nạp currentLocaiton
        locations[count++] = [currentLocation.longitude, currentLocation.latitude];
        for (let i = 0; i < size; i++) {
            locations[count++] = [aimRequest[i].geo1.longitude, aimRequest[i].geo1.latitude];
            locations[count++] = [aimRequest[i].geo2.longitude, aimRequest[i].geo2.latitude];
        }
        //nạp pressLocation
        locations[count++] = [pressLocation.longitude, pressLocation.latitude];
        //kiểm tra locations
        console.log(locations);
        //get matrix api
        const matrix = await getMatrix(locations);
        //lỗi get matrix
        if(matrix[0].length>0){
            return Alert.alert(
                "No request is aviable!",
                "There is no claim to match your route!",
                [
                    {
                        text: "OK",
                    },
                ]
            );
        }
        //smartDirection
        setMatrix(matrix);
        //init price array
        let price = [];
        let count2 = 0;
        aimRequest.map(r => price[count2++] = r.price);
        const length = matrix[0].length;
        //init distance array
        const distance = [];
        for (let i = 1; i <= size; i++) {
            distance[i - 1] = [matrix[i * 2 - 1][i * 2], price[i - 1]];
        }
        //giá trị raw distance
        const raw = matrix[0][length - 1];
        let requestPair = [];
        let maxProfit = 0;
        //find for pair-request
        for (let i = 1; i <= size; i++) {
            let min = 999999999;
            for (let j = 1; j <= size; j++) {
                if (i == j) {
                    continue;
                }
                const cost = distance[i - 1][0] + distance[j - 1][0] + matrix[0][i * 2 - 1] + matrix[j * 2][length - 1] + matrix[i * 2][j * 2 - 1];
                const amount = distance[i - 1][1] + distance[j - 1][1];
                if (cost <= min) {
                    min = cost;
                    if (maxProfit < amount / (cost - raw))
                        maxProfit = amount / (cost - raw);
                    requestPair[i - 1] = { ida: aimRequest[i - 1].requestId, idb: aimRequest[j - 1].requestId, cost: cost - raw, price: amount, hight: amount / (cost - raw) };
                }
            }
        }
        //find for only a request
        for (let i = 1; i <= size; i++) {
            let min = 999999999;
            const cost = distance[i - 1][0] + matrix[0][i * 2 - 1] + matrix[i * 2][length - 1];
            const amount = distance[i - 1][1];
            if (cost <= min) {
                min = cost;
                if (maxProfit < amount / (cost - raw))
                    maxProfit = amount / (cost - raw);
                requestPair[i - 1 + size] = { ida: aimRequest[i - 1].requestId, idb: 0, cost: cost - raw, price: amount, hight: amount / (cost - raw) };
            }
        }
        // hiển thị theo %
        // requestPair.map(r => r.hight = r.hight / maxProfit * 100);
        // sort result
        requestPair.sort((a, b) => {
            if (a.hight == b.hight)
                return a.cost - b.cost;
            else
                return b.hight - a.hight;
        });
        //test result
        console.log(raw);
        console.log("--------------------------------------");
        console.log(requestPair);
        setResult(requestPair);
        
    }

    const renderResultList = () => {
        return (
            <FlatList
                data={filterResult()}
                renderItem={({ item, index = 0 }) => <View style={{
                    marginBottom: 5,
                    padding: 5,
                }}>
                    <View style={{
                        //height: 100,
                        //borderWidth: 1,
                        backgroundColor: colorTheme,
                        padding: 10,
                        justifyContent: 'center',
                    }}>
                        <Text style={{ color: colorText, fontWeight: 'bold' }}>
                            {index == 0 ? <Icon name="shipping-fast" size={15} /> : ''}
                            {index < 3 ? 'Top ' : ''}
                            {index + 1}
                        </Text>
                        <View style={{ height: 3, backgroundColor: '#c076c4', width: '30%' }} />
                        <View style={{
                            flexDirection: 'row'
                        }}>
                            <View style={{
                                width: 280,
                            }}>
                                <Text style={{ color: colorText }}>Tổng tiền: {formatNumber(item.price)}đ</Text>
                                <Text style={{ color: colorText }}>
                                    Quảng đường phát sinh: {Math.ceil(item.cost / 100) / 10}km
                                </Text>
                                <Text style={{ color: colorText }}>Độ hiệu quả: {Math.ceil(item.hight)}.000đ/km</Text>
                                <Text style={{ color: colorText }}>Số lượng yêu cầu: {item.idb == 0 ? "1" : "2"}</Text>
                            </View>
                            <View style={{
                                justifyContent: 'center',
                            }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        handleTapDetail(item);
                                    }}
                                    style={{
                                        //backgroundColor: 'red',
                                        padding: 7,
                                    }}>
                                    <Text style={{
                                        fontSize: fontSizes.h4,
                                        color: colorIcon
                                    }}><Icon name="hand-point-right" size={17} /> Chi tiết</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: colorText, width: '90%', alignSelf: 'center' }} />
                </View>}
                keyExtractor={eachResult => eachResult.hight}
            />
        );
    };

    const handleTapDetail = async (item) => {
        setSelectedResult(item);
        setSelectedRequest1(requests.find(r => r.requestId === item.ida));
        setSelectedRequest2(requests.find(r => r.requestId === item.idb) || null);
        setDisplayRequest1(true);
        setModalVisible(true);
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
                {!result && <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    //backgroundColor: 'white',
                }}>
                    <Icon name={"search"}
                        size={20}
                        color={'black'}
                        marginStart={5}
                        style={{
                            position: 'absolute'
                        }}
                    />
                    <TextInput
                        value={searchAddress}
                        onChangeText={setSearchAddress}
                        onEndEditing={() => {
                            handleSearchAddress();
                        }}
                        autoCorrect={false}
                        numberOfLines={1}
                        placeholder="nhập địa điểm muốn đến"
                        placeholderTextColor={"black"}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            flex: 1,
                            height: normalize(36),
                            borderRadius: 5,
                            opacity: 0.6,
                            color: "black",
                            paddingStart: 30,
                        }}
                    />
                </View>}
                {!result && currentRoute && <View style={{
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
                        }}>Thời gian: {Math.ceil(currentRoute.duration / 60)} phút</Text>
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
                        }}>Khoảng cách: {Math.ceil(currentRoute.distance / 100) / 10} km</Text>
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
                {result ? <View style={{
                    flex: 30,
                    // marginHorizontal: split.s5,
                    // marginVertical: split.s5,
                }}>
                    <View style={{
                        backgroundColor: colorTheme,
                        borderBottomWidth: 1,
                        borderTopWidth: 1,
                        height: normalize(350),
                    }}>
                        <Modal visible={modalVisible} animationType="fade" transparent={true}  >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                {selectedResult && (
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}>
                                        {displayRequest1 ? <QuickView selectedRequest={selectedRequest1} />
                                            : <QuickView selectedRequest={selectedRequest2} />}
                                        {selectedRequest2 && <TouchableOpacity
                                            onPress={() => {
                                                setDisplayRequest1(!displayRequest1);
                                            }}
                                            style={{
                                                justifyContent: 'center',
                                                position: 'absolute',
                                                alignSelf: 'center',
                                                right: '6%',
                                            }}>
                                            <View style={{
                                                borderWidth: 1,
                                                borderRadius: 20,
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                backgroundColor: primary,
                                            }}>
                                                <Text style={{
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>{displayRequest1 ? 'Next' : 'Back'}</Text>
                                            </View>
                                        </TouchableOpacity>}
                                    </View>
                                )}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                }}>
                                    <CLButton title="Accept" sizeBT={"35%"} height={normalize(30)}
                                        onPress={() => acceptRequest()} />
                                    <CLButton title="Close Modal" sizeBT={"35%"} height={normalize(30)}
                                        onPress={() => handleCloseRequest()} />
                                </View>
                            </View>
                        </Modal>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setHightProfit(false);
                                }}
                                style={{
                                    backgroundColor: hightProfit ? '#5d36bb' : colorTheme,
                                    width: 205,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 35,
                                    borderRightWidth: 1,
                                    borderBottomWidth: hightProfit ? 1 : 0,
                                }}>
                                <Text style={{ color: hightProfit ? 'white' : '#5d36bb', fontWeight: !hightProfit ? '900' : 'normal' }}>Best choice</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setHightProfit(true);
                                }}
                                style={{
                                    backgroundColor: hightProfit ? colorTheme : '#5d36bb',
                                    width: 205,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 35,
                                    borderBottomWidth: hightProfit ? 0 : 1,
                                }}>
                                <Text style={{ color: hightProfit ? '#5d36bb' : 'white', fontWeight: hightProfit ? 'bold' : 'normal' }}>Hight profit</Text>
                            </TouchableOpacity>
                        </View>
                        {result ? renderResultList() : <View />}
                    </View>
                </View>
                    : currentLocation && <View style={{
                        flex: 30,
                        height: normalize(300),
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
                            onPress={(event) => {
                                if (currentRoute) {
                                    return Alert.alert(
                                        "Current Route is aviable",
                                        "Are you sure you want change your route?",
                                        [
                                            {
                                                text: "Yes",
                                                onPress: () => {
                                                    setCurrentRoute(null);
                                                },
                                            },
                                            {
                                                text: "No",
                                            },
                                        ]
                                    );
                                }
                                else {
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
                        {displaySearch && <Text style={{
                            color: 'black',
                            fontSize: fontSizes.h4,
                            position: 'absolute',
                            bottom: normalize(20),
                            left: normalize(60),
                            right: normalize(45),
                            backgroundColor: 'white'
                        }}>{displaySearch}</Text>}
                    </View>}
                <TouchableOpacity
                    onPress={() => {
                        if (currentRoute)
                            return Alert.alert(
                                "Current Route is aviable",
                                "Are you sure you want change your route?",
                                [
                                    {
                                        text: "Yes",
                                        onPress: () => {
                                            setCurrentRoute(null);
                                            setDisplaySearch(null);
                                            setSearchAddress(null);
                                        },
                                    },
                                    {
                                        text: "No",
                                    },
                                ]
                            );
                        else
                            handlePressInitCurrentRoute();
                    }}
                    disabled={!pressLocation}
                    style={{
                        borderColor: primary,
                        borderWidth: 1,
                        height: 45,
                        width: '90%',
                        borderRadius: 30,
                        marginHorizontal: 14,
                        marginVertical: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        backgroundColor: pressLocation ? primary : inactive,
                    }}>
                    <Text style={{
                        fontSize: fontSizes.h3,
                        color: 'white',
                    }}>Cập nhật đường đi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        if (result) {
                            setResult(null);
                            console.log("smartDirection")
                        }
                        else {
                            if (historyPressLocation === pressLocation)
                                return Alert.alert(
                                    "No change",
                                    "Look like your destination same old smartDriection input, change it first?",
                                    [
                                        {
                                            text: "Yes",
                                            onPress: () => {
                                                setCurrentRoute(null);
                                                setDisplaySearch(null);
                                                setSearchAddress(null);
                                                setPressLocation(null);
                                            },
                                        },
                                        {
                                            text: "No",
                                        },
                                    ]
                                );
                            else
                                handleSmartDirection();
                        }
                    }}
                    disabled={!currentRoute}
                    style={{
                        borderColor: primary,
                        borderWidth: 1,
                        height: 45,
                        width: '90%',
                        borderRadius: 30,
                        marginHorizontal: 14,
                        marginVertical: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        backgroundColor: currentRoute ? primary : inactive,
                    }}>
                    <Text style={{
                        fontSize: fontSizes.h3,
                        color: 'white',
                    }}>Smart Direction</Text>
                </TouchableOpacity>
                <View style={{ height: 50 }} />
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