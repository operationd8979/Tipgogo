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
import { distanceTwoGeo } from '../../utilies'
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { mapStyle, findShortestPaths, formatNumber } from '../../utilies'
import { getDirectionDriver, getRouteDirection, getMatrix, getLocationFromAddress } from '../../service/MapService'
import { getUserIDByTokken } from '../../service/UserService'
import { QuickView, CLButton } from '../../components'
import i18n from "../../../i18n";


const WaitingScreen = () => {
    return (
        <View style={{ alignItems: 'center', marginTop: '50%' }}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{
                color: 'black',
            }}>
                {i18n.t('p_waitingLocation')}</Text>
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
                {i18n.t('p_waitingOnAvaiable')}</Text>
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
        //handleSmartDirection();
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

        const orgin = currentLocation;
        const destination = pressLocation;
        //dữ liệu test
        // const orgin = { latitude: 10.80225935, longitude: 106.7148688};
        // const destination = { latitude: 10.7551377, longitude: 106.6643887};

        const aimRequest = requests.filter(r => r.status == 0 && r.type === 1
            && Inbounds(orgin, destination, r.geo1, r.geo2));
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
        locations[count++] = [orgin.longitude, orgin.latitude];
        for (let i = 0; i < size; i++) {
            locations[count++] = [aimRequest[i].geo1.longitude, aimRequest[i].geo1.latitude];
            locations[count++] = [aimRequest[i].geo2.longitude, aimRequest[i].geo2.latitude];
        }
        //nạp pressLocation
        locations[count++] = [destination.longitude, destination.latitude];
        //kiểm tra locations
        console.log(locations);
        //get matrix api
        const matrix = await getMatrix(locations);
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

    const acceptRequest = async () => {
        const testorgin = { latitude: 10.80225935, longitude: 106.7148688};
        const testdestination = { latitude: 10.7551377, longitude: 106.6643887};
        setIsLoading(true);
        if (selectedResult) {
            const{
                ida,
                idb,
            } = selectedResult;
            const userID = await getUserIDByTokken();
            if (currentLocation && userID) {
                let origin = "";
                let destination = "";
                let direction1 = null;
                let direction2 = null;
                let direction3 = null;
                // origin = currentLocation;
                origin = testorgin;
                destination = selectedRequest1.geo1;
                if (destination != "" && origin != "")
                    direction1 = await getDirectionDriver(origin, destination);
                if (!direction1) {
                    console.log("Get direction [1] failed!");
                    setIsLoading(false);
                    return;
                }
                if(selectedRequest2){
                    direction1 = {...direction1,smart:{index:1,id:idb}};
                    origin = selectedRequest1.geo2;
                    destination = selectedRequest2.geo1;
                    if (destination != "" && origin != "")
                        direction2 = await getDirectionDriver(origin, destination);
                    if (!direction2) {
                        console.log("Get direction [2] failed!");
                        setIsLoading(false);
                        return;
                    }
                    else{
                        direction2.duration+= direction1.duration;
                        direction2.currentDriver = currentLocation;
                        direction2 = {...direction2,smart:{index:2,id:ida}};
                    }
                    origin = selectedRequest2.geo2;
                    // destination = pressLocation;
                    destination=testdestination;
                    if (destination != "" && origin != "")
                        direction3 = await getDirectionDriver(origin, destination);
                    if (!direction3) {
                        console.log("Get direction [3] failed!");
                        setIsLoading(false);
                        return;
                    }
                    else{
                        direction3.duration+= direction2.duration;
                        direction3.currentDriver = currentLocation;
                    }
                }
                set(ref(firebaseDatabase, `direction/${userID}/${selectedRequest1.requestId}`), direction1)
                    .then(async () => {
                        console.log("Direction update[1]!.");
                        // const userID = await getUserIDByTokken();
                        const requestRef = ref(firebaseDatabase, `request/${selectedRequest1.requestId}`);
                        update(requestRef, { requestStatus: userID })
                            .then(() => {
                                console.log("Accepted request[1]! GOGOGO TIP!.");
                            })
                            .catch((error) => {
                                console.log("Error updating request[1] status: ", error);
                            });
                    })
                    .catch((error) => {
                        console.log("Error updating direction[1]: ", error);
                        setIsLoading(false);
                    });
                if(selectedRequest2){
                    set(ref(firebaseDatabase, `direction/${userID}/${selectedRequest2.requestId}`), direction2)
                    .then(async () => {
                        console.log("Direction update[2]!.");
                        // const userID = await getUserIDByTokken();
                        const requestRef = ref(firebaseDatabase, `request/${selectedRequest2.requestId}`);
                        update(requestRef, { requestStatus: userID })
                            .then(() => {
                                console.log("Accepted request[2]! GOGOGO TIP!.");
                            })
                            .catch((error) => {
                                console.log("Error updating request[2] status: ", error);
                            });
                    })
                    .catch((error) => {
                        console.log("Error updating direction[2]: ", error);
                        setIsLoading(false);
                    });
                    set(ref(firebaseDatabase, `direction/${userID}/${selectedRequest1.requestId}-${selectedRequest2.requestId}`), direction3)
                    .then(async () => {
                        console.log("Direction update[3]!.");
                    })
                    .catch((error) => {
                        console.log("Error updating direction[3]: ", error);
                        setIsLoading(false);
                    });
                }
                
            }
            else {
                console.log("Current location is null!");
            }
        }
        else {
            console.log("No request selected!");
        }
        setSelectedResult(null);
        setSelectedRequest1(null);
        setSelectedRequest2(null);
        setModalVisible(false);
        setIsLoading(false);
    }

    const handleCloseRequest = () => {
        setSelectedResult(null);
        setSelectedRequest1(null);
        setSelectedRequest2(null);
        setModalVisible(false);
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
                                <Text style={{ 
                                    color: colorText,
                                    fontWeight: hightProfit? "bold" : "normal",
                                }}>{i18n.t('sm_totalPrice')}: {formatNumber(item.price)}đ</Text>
                                <Text style={{ 
                                    color: colorText,
                                    fontWeight: hightProfit? "normal" : "bold",
                                }}>
                                    {i18n.t('sm_costPath')}: {Math.ceil(item.cost / 100) / 10}km
                                </Text>
                                <Text style={{ 
                                    color: colorText,
                                    fontWeight: hightProfit? "bold" : "normal",
                                }}>{i18n.t('sm_quality')}: {Math.ceil(item.hight)}.000đ/km</Text>
                                <Text style={{ color: colorText }}>{i18n.t('sm_numberRequest')}: {item.idb == 0 ? "1" : "2"}</Text>
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
                                    }}><Icon name="hand-point-right" size={17} />{i18n.t('sm_detail')}</Text>
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
                        placeholder={i18n.t('sm_findDes')}
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
                        }}>{i18n.t('p_time')}: {Math.ceil(currentRoute.duration / 60)} {i18n.t('p_minute')}</Text>
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
                        }}>{i18n.t('p_duration')}: {Math.ceil(currentRoute.distance / 100) / 10} {i18n.t('p_kilometer')}</Text>
                    </View>
                    <Text style={{
                        color: 'black',
                        position: 'relative',

                    }}>{i18n.t('sm_currentLocation')}: {currentRoute.startAddress}</Text>
                    <Text style={{
                        color: 'black',
                        position: 'relative',
                    }}>{i18n.t('sm_aimDestination')}: {currentRoute.endAddress}</Text>
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
                                    backgroundColor: 'white'
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
                                    backgroundColor: hightProfit ? inactive : colorTheme,
                                    width: 205,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 35,
                                    borderRightWidth: 1,
                                    borderBottomWidth: hightProfit ? 1 : 0,
                                }}>
                                <Text style={{ color: hightProfit ? 'white' : '#5d36bb', fontWeight: !hightProfit ? '900' : 'normal' }}>{i18n.t('sm_bestChoice')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setHightProfit(true);
                                }}
                                style={{
                                    backgroundColor: hightProfit ? colorTheme : inactive,
                                    width: 205,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 35,
                                    borderBottomWidth: hightProfit ? 0 : 1,
                                }}>
                                <Text style={{ color: hightProfit ? '#5d36bb' : 'white', fontWeight: hightProfit ? 'bold' : 'normal' }}>{i18n.t('sm_hightProfit')}</Text>
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
                                        i18n.t('cr_currentRouteT'),
                                        i18n.t('cr_currentRouteD'),
                                        [
                                            {
                                                text: i18n.t('p_yes'),
                                                onPress: () => {
                                                    setCurrentRoute(null);
                                                },
                                            },
                                            {
                                                text: i18n.t('p_no'),
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
                                i18n.t('cr_currentRouteT'),
                                i18n.t('cr_currentRouteD'),
                                [
                                    {
                                        text: i18n.t('p_yes'),
                                        onPress: () => {
                                            setCurrentRoute(null);
                                            setDisplaySearch(null);
                                            setSearchAddress(null);
                                        },
                                    },
                                    {
                                        text: i18n.t('p_no'),
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
                    }}>{i18n.t('sm_loadRoute')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        if (result) {
                            return Alert.alert(
                                i18n.t('sm_currentResultT'),
                                i18n.t('sm_currentResultD'),
                                [
                                    {
                                        text: i18n.t('p_yes'),
                                        onPress: () => {
                                            setResult(null);
                                            setHistoryPressLocation(null);
                                        },
                                    },
                                    {
                                        text: i18n.t('p_no'),
                                    },
                                ]
                            );
                        }
                        else {
                            if (historyPressLocation === pressLocation)
                                return Alert.alert(
                                    i18n.t('sm_historyDestinationT'),
                                    i18n.t('sm_historyDestinationD'),
                                    [
                                        {
                                            text: i18n.t('p_yes'),
                                            onPress: () => {
                                                setCurrentRoute(null);
                                                setDisplaySearch(null);
                                                setSearchAddress(null);
                                                setPressLocation(null);
                                            },
                                        },
                                        {
                                            text: i18n.t('p_no'),
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
                    }}>{i18n.t('sm_smartDirection')}</Text>
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