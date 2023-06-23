import React, { useState, useRef, useEffect, useCallback } from "react"
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, Platform, Image, Linking, RefreshControl, ActivityIndicator } from "react-native"
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import { CLButton } from '../../components'
import { Picker } from '@react-native-picker/picker'
import { TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
    firebaseDatabase,
    ref,
    get,
    set,
    orderByChild,
    uploadBytes,
    getDownloadURL,
    storageRef,
    storage,
    equalTo,
    query,
    onValue,
} from "../../../firebase/firebase"
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Polyline } from 'react-native-maps';
import i18n from '../../../i18n'
import { mapStyle, formatNumber } from '../../utilies'
import ImageResizer from 'react-native-image-resizer';
import useMap from '../FullMap/FullMap'
import { getAddressFromLocation, getRouteDirection, getLocationFromAddress } from '../../service/MapService'
import { checkCameraPermission } from '../../service/CameraService'
import {getUserIDByTokken} from '../../service/UserService'

const CreateRequest = (props) => {

    //test
    // const currentLocation = {latitude:10.7989905  , longitude:106.7068081  }

    //constant
    const { primary, zalert, warning, success, inactive } = colors
    const mapRef = useRef(null);
    const {
        currentLocation,
        pressLocation,
        setPressLocation,
        checkLocationPermission,
        getCurrentPosition,
    } = useMap();

    //request's const
    const [requests, setRequests] = useState(null);
    const [typeRequest, setTypeRequest] = useState(1);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(null);
    const [des, setDes] = useState("");
    const [currentRoute, setCurrentRoute] = useState(null);
    const [address, setAddress] = useState(null);
    const [detailAddress, setDetailAddress] = useState(null);
    //error const request
    const [errorPhotoUri, setErrorPhotoUri] = useState(null);
    const [errorCurrentLocation, setErrorCurrentLocation] = useState(null);
    const [errorPressLocation, setErrorPressLocation] = useState(null);
    const [errorTypeRequest, setErrorTypeRequest] = useState(null);
    const [errorTitle, setErrorTitle] = useState(null);
    const [errorPrice, setErrorPrice] = useState(null);
    const [errorAddress, setErrorAddress] = useState(null);
    const [errorOnHitchhiking, setErrorOnHitchhiking] = useState(null);

    //function's const
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [photoPath, setPhotoPath] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const camera = useRef(null);
    const devices = useCameraDevices('ultra-wide-angle-camera')
    const device = devices.back
    const [titleAmount, setTitleAmount] = useState("Pay");
    const [isEnabledFree, setIsEnabledFree] = useState(false);
    const [showIndicator, setShowIndicator] = useState(false);
    const [searchAddress, setSearchAddress] = useState(null);
    const [displaySearch, setDisplaySearch] = useState(null);
    const [onHitchhiking, setOnHitchhiking] = useState(false);

    const onRefresh = useCallback(() => {
        console.log("-------On refreshing------");
        setIsLoading(true);
        setRefreshing(true);
        setTimeout(() => {
            setPhotoPath(null);
            setCurrentRoute(null);
            setDisplaySearch(null);
            setSearchAddress(null);
            setAddress(null);
            setDetailAddress(null);
            setTypeRequest(1);
            setTitle("");
            setPrice(null);
            setTitleAmount("Pay");
            setIsEnabledFree(false);
            setDes("");
            setErrorPhotoUri(null);
            setErrorCurrentLocation(null);
            setErrorPressLocation(null);
            setErrorTypeRequest(null);
            setErrorTitle(null);
            setErrorPrice(null);
            setErrorAddress(null);
            setErrorOnHitchhiking(null);
            handleGetCurrentLocation();
            setRefreshing(false);
            setIsLoading(false);
        }, 1500);
        console.log("-------already done------");
    }, []);

    useEffect(() => {
        console.log('________________Init createRequest________________');
        checkCameraPermission();
        checkLocationPermission();
        getCurrentPosition();
        //lấy request
        const dbRef = ref(firebaseDatabase, 'request') 
        const unsubscribe = onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('Read data to listRequest (MyRequestList)');
                setOnHitchhiking(false);
                const userID = await getUserIDByTokken();
                let snapshotObject = snapshot.val()
                Object.keys(snapshotObject).filter(k=>k.split('-')[0]==userID)
                    .map(eachKey => {
                        let eachObject = snapshotObject[eachKey];
                        if(eachObject.typeRequest===1){
                            if(eachObject.requestStatus!=1&&eachObject.requestStatus!=-1){
                                setOnHitchhiking(true);
                            }
                            else{
                                setOnHitchhiking(false);
                            }
                        }
                    })
            } else {
                console.log('No data available')
            }
        })
        console.log(onHitchhiking);
        return unsubscribe;
    }, [])

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
            if (typeRequest === 1) {
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
            else {
                if (currentRoute) {
                    setDisplaySearch(null);
                    setSearchAddress(null);
                    setCurrentRoute(null);
                }
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
        }
    };

    const handlePressCamera = async () => {
        console.log('-------Press camera--------');
        try {
            const photo = await camera.current.takePhoto({});
            const filePath = "file://" + photo.path;
            const resizedImage = await ImageResizer.createResizedImage(filePath, 800, 800, 'JPEG', 80);
            const { uri: resizedUri, path } = resizedImage;
            console.log(`uri photo:${resizedUri}`);
            setModalVisible(false);
            setPhotoPath(resizedUri);
            console.log('------Close camera------');
        } catch (e) {
            console.log(e)
        }
    };

    const uploadImage = async (userID, timestamp, uri) => {
        try {
            const ref = storageRef(storage, `UserPhoto/${userID}/${userID}-${timestamp}.jpg`);
            const fileData = await fetch(uri);
            const bytes = await fileData.blob();
            const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(snapshot.ref);
            console.log("Uploaded OK! URL:", url);
            return url;
        } catch (error) {
            console.log(error);
            return null;
        }
    };


    const toggleSwitchPrice = () => {
        setIsEnabledFree(previousState => !previousState);
        setTitleAmount(preTitle => preTitle === "Pay" ? "Free" : "Pay");
        setPrice("");
    }

    function validateCredentials() {
        let result = true;
        setErrorTitle(null);
        setErrorPrice(null);
        setErrorAddress(null);
        setErrorPhotoUri(null);
        setErrorCurrentLocation(null);
        setErrorPressLocation(null);
        setErrorTypeRequest(null);
        setErrorOnHitchhiking(null);
        if (typeRequest === 2 && !title) {
            setErrorTitle(i18n.t('titleErr1'));
            result = false;
        }
        if (!price) {
            if (isEnabledFree)
                setPrice("0");
            else {
                setErrorPrice(i18n.t('priceErr1'));
                result = false;
            }
        }
        if (typeRequest === 2 && (!address || !detailAddress)) {
            setErrorAddress(i18n.t('addressErr1'));
            result = false;
        }
        if (typeRequest === 2 && !photoPath) {
            setErrorPhotoUri(i18n.t('photoErr1'));
            result = false;
        }
        if (!currentLocation) {
            setErrorCurrentLocation(i18n.t('locationErr1'));
            result = false;
        }
        if (typeRequest === 1 && !pressLocation) {
            setErrorPressLocation(i18n.t('locationErr1'));
            result = false;
        }
        if (typeRequest === 1){
            if(onHitchhiking){
                setErrorOnHitchhiking(i18n.t('hitchhikingErr'));
                result = false;
            }
        }

        return result
    }

    const handleLoadMap = async () => {
        setIsLoading(true);
        setShowIndicator(true);
        if (typeRequest === 1) {
            if (currentLocation && pressLocation) {
                try {
                    const route = await getRouteDirection(currentLocation, pressLocation);
                    setCurrentRoute(route);
                } catch (error) {
                    console.log(error);
                    setIsLoading(false);
                    setShowIndicator(false);
                }
            }
            else {
                console.log("Presslocation is not avaiable!");
            }
        }
        else {
            const location = pressLocation || currentLocation;
            const response = await getAddressFromLocation(location.latitude, location.longitude);
            const address = {
                road: response.address.road,
                suburb: response.address.suburb,
                district: response.address.city_district,
                city: response.address.city,
            }
            setDetailAddress(`${address.road ? address.road + ", " : ""}${address.suburb ? address.suburb + ", " : ""}${address.district ? address.district + ", " : ""}${address.city}`);
        }
        setIsLoading(false);
        setShowIndicator(false);
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
            }
        }
        else {
            console.log("Search String is not ")
        }
        setIsLoading(false);
    }

    const handlePostRequest = async () => {
        if (validateCredentials()) {
            setIsLoading(true);
            setShowIndicator(true);
            console.log('------------Postting request------------');
            const timestamp = (new Date()).getTime();
            const accessToken = await AsyncStorage.getItem('token');
            const dbRef = ref(firebaseDatabase, "users");
            const dbQuery = query(dbRef, orderByChild("accessToken"), equalTo(accessToken));
            const data = await get(dbQuery);
            const userID = Object.keys(data.val())[0];
            let uploadedImageUrl = null;
            let direction = null;
            if (typeRequest === 2) {
                uploadedImageUrl = await uploadImage(userID, timestamp, photoPath);
                if (!uploadedImageUrl) {
                    console.log("Image upload failed!");
                    setIsLoading(false);
                    setShowIndicator(false);
                    return;
                }
            }
            if (typeRequest === 1) {
                if (currentRoute && currentRoute.destination === pressLocation)
                    direction = currentRoute;
                else
                    direction = await getRouteDirection(currentLocation, pressLocation);
                if (!direction) {
                    console.log("Get direction failed!");
                    setIsLoading(false);
                    setShowIndicator(false);
                    return;
                }
            }
            let request = {
                title: typeRequest === 1 ? `${direction.summary}` : title,
                des: des,
                price: price ? parseInt(price) : 0,
                //geo1: currentLocation,
                geo1: currentLocation,
                geo2: pressLocation ? pressLocation : currentLocation,
                photo: uploadedImageUrl,
                direction: direction,
                typeRequest: typeRequest,
                requestStatus: 0,
                address: typeRequest === 2 ? `${address}, ${detailAddress}` : null,
                timestamp: timestamp,
            }
            set(ref(firebaseDatabase, `request/${userID}-${timestamp}`), request)
                .then(() => {
                    console.log("Data written to Firebase Realtime Database.");
                    setIsLoading(false);
                    setShowIndicator(false);
                    onRefresh();
                })
                .catch((error) => {
                    console.log("Error writing data to Firebase Realtime Database: ", error);
                    setIsLoading(false);
                    setShowIndicator(false);
                    onRefresh();
                });
        }

    }

    return (
        <KeyboardAwareScrollView
            enableResetScrollToCoords={true}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                    }}>Create Request</Text>
                    {/*const {onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled,height} = props*/}
                    <CLButton title={"Re-New"} sizeBT="20%" radius={7} onPress={onRefresh} disabled={isLoading} />
                </View>
                <View style={{ height: 1, backgroundColor: primary }} />
            </View>
            <View style={{
                flex: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red',
            }}>
                <View style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 7,
                    width: normalize(310),
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingStart: 10,
                }}>
                    <Text style={{ fontSize: fontSizes.h5, color: "#191970" }}>Danh mục |</Text>
                    <Picker
                        selectedValue={typeRequest}
                        style={{
                            flex: 1,
                            height: 50,
                            color: 'black',
                        }}
                        onValueChange={(itemValue, itemIndex) => setTypeRequest(itemValue)}
                    >
                        <Picker.Item label="Hitchhiking" value={1} />
                        <Picker.Item label="Secondhand Stuff" value={2} />
                        {/* <Picker.Item label="Delivery" value={3} /> */}
                    </Picker>
                </View>
            </View>
            {typeRequest === 2 && <View style={{
                flex: 8,
                alignItems: 'center',
                flexDirection: 'row',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red'
            }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    position: 'absolute',
                    left: split.s1,
                    color: "black",
                }}>Tiêu đề :</Text>
                <TextInput style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 15,
                    width: 390,
                    paddingStart: "15%",
                    marginHorizontal: 10,
                    color: "black",
                }}
                    numberOfLines={1}
                    editable={!isLoading}
                    value={title}
                    onChangeText={setTitle}
                    autoCorrect={false}
                    placeholder={errorTitle ? errorTitle : ""}
                    placeholderTextColor={zalert}
                />
            </View>}
            <View style={{
                flex: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red'
            }}>
                <TextInput
                    editable={!isLoading && !isEnabledFree}
                    style={{
                        borderWidth: 1,
                        borderColor: !isEnabledFree ? "black" : success,
                        borderRadius: 15,
                        width: "70%",
                        paddingHorizontal: 10,
                        marginHorizontal: 10,
                        color: "black",
                    }}
                    placeholder={!isEnabledFree ? (errorPrice ? errorPrice : "Price") : "0 VND"}
                    value={formatNumber(price)}
                    onChangeText={(text) => {
                        const filteredText = text.replace(/[^0-9]/g, '');
                        setPrice(filteredText);
                    }}
                    numberOfLines={1}
                    autoCorrect={false}
                    keyboardType="numeric"
                    placeholderTextColor={!isEnabledFree ? (errorPrice ? zalert : inactive) : success}
                />
                <Text style={{
                    fontSize: fontSizes.h4,
                    color: isEnabledFree ? success : zalert,
                }}>{titleAmount}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "green" }}
                    thumbColor={isEnabledFree ? success : "#f4f3f4"}
                    onValueChange={toggleSwitchPrice}
                    value={isEnabledFree}
                    disabled={isLoading}
                    style={{
                        marginEnd: 10,
                        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
                    }}
                />
            </View>
            {typeRequest === 2 && <View style={{
                flex: 16,
                marginHorizontal: 5,
                flexDirection: 'row',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                height: normalize(60),
                //backgroundColor:"red",
            }}>
                <CLButton
                    title="Camera"
                    onPress={() => setModalVisible(true)}
                    sizeBT="25%"
                    height="100%"
                    radius={20}
                    colorBG="#b0e0e6"
                    colorT="#000080"
                    disabled={isLoading}
                />
                {photoPath && <Image
                    style={{
                        width: "20%",
                        height: "100%",
                        alignSelf: "center",
                        borderRadius: 10
                    }}
                    defaultSource={require('../../assets/helpbuy.jpg')}
                    source={{ uri: "file://" + photoPath }}
                />}
                <Modal visible={modalVisible} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {modalVisible && device && (
                            <View style={styles.container}>
                                <Camera
                                    ref={camera}
                                    style={{
                                        height: "85%",
                                        width: "100%",
                                        marginBottom: split.s3,
                                    }}
                                    device={device}
                                    isActive={true}
                                    preset="medium"
                                    photo={true}
                                />
                                <TouchableOpacity
                                    onPress={handlePressCamera}
                                >
                                    <View
                                        style={{
                                            borderWidth: 2,
                                            borderColor: "white",
                                            height: 50,
                                            width: 50,
                                            borderRadius: 30,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginBottom: 20,
                                            alignSelf: 'center',
                                        }}
                                    />
                                </TouchableOpacity>
                                {/*<Button title="Close Camera" onPress={handleCloseCamera} />*/}
                            </View>
                        )}
                        <CLButton title="Close Modal" onPress={() => setModalVisible(false)} />
                    </View>
                </Modal>
            </View>}
            {typeRequest === 2 && <View style={{
                flex: 8,
                alignItems: 'center',
                flexDirection: 'row',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                justifyContent: 'center',
                //backgroundColor:'red'
            }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    position: 'absolute',
                    left: split.s1,
                    color: "black",
                }}>Số nhà:</Text>
                <TextInput style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 15,
                    width: normalize(295),
                    paddingStart: "15%",
                    marginHorizontal: 10,
                    color: "black",
                }}
                    numberOfLines={1}
                    editable={!isLoading}
                    value={address}
                    onChangeText={setAddress}
                    autoCorrect={false}
                    placeholder={errorAddress ? errorAddress : "số nhà, tên đường"}
                    placeholderTextColor={errorAddress ? zalert : inactive}
                />
            </View>}
            {typeRequest === 2 && <View style={{
                flex: 8,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginHorizontal: split.s5,
                marginVertical: split.s5,
                //backgroundColor:'red'
            }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    position: 'absolute',
                    left: split.s1,
                    color: "black",
                }}>Địa chỉ:</Text>
                <TextInput style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 15,
                    width: normalize(295),
                    paddingStart: "15%",
                    color: "black",
                    fontSize: fontSizes.h4 * 0.9,
                }}
                    multiline={true}
                    editable={!isLoading}
                    value={detailAddress}
                    onChangeText={setDetailAddress}
                    autoCorrect={false}
                    placeholder={errorAddress ? errorAddress : "phường , quận, thành phố"}
                    placeholderTextColor={errorAddress ? zalert : inactive}
                />
            </View>}
            {typeRequest===1&&errorOnHitchhiking&&<Text style={{
                color: 'red',
                alignSelf:'center',
                fontSize: fontSizes.h4
                }}>{errorOnHitchhiking}
            </Text>}
            {currentLocation && <View style={{
                flex: 30,
                height: normalize(typeRequest === 1 ? 280 : 180),
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
                        coordinate={typeRequest === 2 ? (pressLocation || currentLocation) : currentLocation}
                        tile={"User"}
                        description={"Current User Location"}
                    >
                    </Marker>
                    {typeRequest === 1 && pressLocation && <Marker
                        key={2}
                        coordinate={pressLocation}
                        tile={"Des"}
                        description={"Des Location"}
                    >
                        <Image
                            source={images.markerUrGeo1}
                            style={{ width: 35, height: 35, }}
                        />
                    </Marker>}
                    {typeRequest === 1 && currentRoute && <Polyline
                        coordinates={currentRoute.route}
                        strokeColor={colors.primary}
                        strokeWidth={2}
                    />}
                </MapView>
                {typeRequest === 1 && <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: split.s3,
                    marginTop: split.s4,
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
                {typeRequest === 1 && displaySearch && <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h4,
                    position: 'absolute',
                    bottom: normalize(20),
                    left: normalize(60),
                    right: normalize(45),
                    backgroundColor: 'white'
                }}>{displaySearch}</Text>}
            </View>}
            {currentRoute && <View style={{
                marginHorizontal: normalize(10),
                alignItems: 'center',
            }}>
                <Text style={{ fontSize: fontSizes.h3, color: primary }}>Detail route: {Math.ceil(currentRoute.distance / 100) / 10} km, {Math.ceil(currentRoute.duration / 60)} phút</Text>
                <View>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Từ: {currentRoute.startAddress} </Text>
                    <Text style={{
                        marginTop: normalize(5),
                        color: 'black',
                        fontSize: fontSizes.h4,
                    }}>Đến: {currentRoute.endAddress} </Text>
                </View>
            </View>}
            {showIndicator && <ActivityIndicator size={'large'} animating={showIndicator} />}
            <View style={{
                flex: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: split.s1,
                marginVertical: split.s5,
            }}>
                <CLButton
                    title={"Load map"}
                    colorBG={primary}
                    colorBD={"white"}
                    colorT={"white"}
                    sizeF={fontSizes.h4}
                    sizeBT={130}
                    radius={15}
                    disabled={isLoading}
                    onPress={() => {
                        handleLoadMap();
                    }}
                />
                <CLButton
                    title={"Post request"}
                    colorBG={primary}
                    colorBD={"white"}
                    colorT={"white"}
                    sizeF={fontSizes.h4}
                    sizeBT={130}
                    radius={15}
                    disabled={isLoading}
                    onPress={() => {
                        handlePostRequest();
                    }}
                />
            </View>
            <View style={{
                flex: 30,
                marginHorizontal: 5,
                alignItems: "center",
                height: normalize(120),
                marginHorizontal: split.s5,
                marginVertical: split.s5,
            }}>
                <Text style={{
                    fontSize: fontSizes.h4,
                    position: 'absolute',
                    right: split.s4,
                    top: split.s1,
                    color: "black",
                }}>{typeRequest === 1 ? "| Nội dung |" : "| Ghi chú |"}</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        borderColor: !isEnabledFree ? "black" : success,
                        borderRadius: 15,
                        width: "100%",
                        height: "100%",
                        paddingHorizontal: 10,
                        marginHorizontal: 10,
                        color: 'black',
                        paddingEnd: "20%",
                    }}
                    editable={!isLoading}
                    value={des}
                    onChangeText={setDes}
                    autoCorrect={false}
                    multiline={true}
                    placeholder={"không bắt buộc..."}
                    placeholderTextColor={inactive}
                />
            </View>

        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        margin: 20,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        height: 50,
        width: 350,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        marginBottom: 60,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});


export default CreateRequest;
