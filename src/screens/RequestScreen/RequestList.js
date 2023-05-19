import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList, Modal, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import RequestItem from "./RequestItem";
import Category from "./Category";
import { Dropdown, CLButton } from '../../components'
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

import AsyncStorage from '@react-native-async-storage/async-storage'
import {APIkey_Direction} from '../../../Credentials'
/** 
 - ListView from a map of objects
 - FlatList
 */
 const GOOGLE_MAPS_APIKEY = APIkey_Direction;

const getDirections = (origin, destination) => {
    console.log("API direction RUNNING...................!");
    return new Promise(async (resolve, reject) => {
        try {
            console.log("API direction RUNNING...................!");
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/directions/json',
                {
                    params: {
                        origin: origin,
                        destination: destination,
                        key: GOOGLE_MAPS_APIKEY,
                    },
                }
            );
            const routes = response.data.routes;
            debugger
            if (routes && routes.length > 0) {
                const points = routes[0].overview_polyline.points;
                const decodedPoints = decodePolyline(points);
                const direction = {
                    summary: routes[0].summary,
                    startAddress: routes[0].legs[0].start_address,
                    endAddress: routes[0].legs[0].end_address,
                    distance: routes[0].legs[0].distance,
                    duration: routes[0].legs[0].duration,
                    steps: routes[0].legs[0].steps,
                    route: decodedPoints,
                };
                console.log("Direction OK! URL:", direction);
                resolve(direction);
            } else {
                console.error('Error building directions!');
                resolve(null);
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            resolve(null);
        }
    });
};

const decodePolyline = (encodedPolyline) => {
    const polyline = require('@mapbox/polyline');
    const decoded = polyline.decode(encodedPolyline);
    return decoded.map((coordinate) => ({
        latitude: coordinate[0],
        longitude: coordinate[1],
    }));
};

const getUserIDByTokken= async () => {
    const accessToken = await AsyncStorage.getItem('token');
    const dbRef = ref(firebaseDatabase,"users");
    const dbQuery = query(dbRef,orderByChild("accessToken"),equalTo(accessToken));
    const data = await get(dbQuery);
    const userID = Object.keys(data.val())[0];
    return userID;
}

const RequestList = (props) => {

    const [typeSelected,setTypeSelected] = useState(null);
    const [isEnableMine,setIsEnableMine] = useState(false);
    //constant
    const { hitchhiking, secondHand, helpBuy } = images
    const { primary, zalert, success, warning, inactive } = colors
    const [categories, setCategories] = useState([
        {
            name: 'Hitchhiking',
            url: hitchhiking,
            value:1,
        },
        {
            name: 'Secondhand Stuff',
            url: secondHand,
            value:2,
        },
        {
            name: 'Your Request',
            url: helpBuy,
            value:0,
        },

    ])

    //element init
    const { navigation } = props
    const { FullMap, currentLocation, getCurrentPosition,checkLocationPermission } = useMap();

    //element function
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [searchText, setSearchText] = useState('')
    const filterRequest = useCallback(() => requests.filter(eachRequest => 
        eachRequest.name.toLowerCase().includes(searchText.toLowerCase())
        &&(!isEnableMine||eachRequest.mine)
        &&(typeSelected==null||eachRequest.type==typeSelected))
    ,[searchText,typeSelected,requests])


    useEffect(() => {
        console.log("__________Init listRequest__________");
        checkLocationPermission();
        getCurrentPosition();
        const dbRef = ref(firebaseDatabase, 'request') 
        onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('Importing data to listRequest')
                const userID = await getUserIDByTokken();
                let snapshotObject = snapshot.val()
                setRequests(Object.keys(snapshotObject)
                    .map(eachKey => {
                        let eachObject = snapshotObject[eachKey]
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
                            accepted: userID==eachObject.requestStatus,
                            timestamp: eachObject.timestamp,
                            mine: eachKey.split('-')[0]==userID,
                        }
                    }))
            } else {
                console.log('No data available')
            }
        })
    }, [])

    //func render requests
    const renderNotRequest = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h2,
                    alignSelf: 'center',
                }}>
                    No Request found!
                </Text>
            </View>
        );
    };
    const renderRequestList = () => {
        return (
            <FlatList
                data={filterRequest()}
                renderItem={({ item }) => <RequestItem
                    onPress={() => {
                        const userID = item.requestId.split("-")[0];
                        //setSelectedRequest(item);
                        //setModalVisible(true);
                        handleTapRequest(item);
                    }}
                    request={item} 
                    currentLocation={currentLocation}
                    />}
                keyExtractor={eachRequest => eachRequest.requestId}
            />
        );
    };

    //func action requests
    // const handleTapRequest = async(item) =>{
    //     setSelectedRequest(item);
    //     setModalVisible(true); 
    //     const userID = await getUserIDByTokken();    
    //     if(item.status==userID){
    //         navigation.navigate("RequestDetail",{request:item});
    //         handleCloseRequest();
    //     }
    // }
    const handleTapRequest = async(item) =>{
        if(item.mine){
            console.log("1");
            navigation.navigate("MyRequest",{request:item});
        }
        if(item.accepted){
            console.log("2");
            navigation.navigate("RequestDetail",{request:item});
        }
        console.log("3");
        setSelectedRequest(item);
        setModalVisible(true); 
    }

    const handleCloseRequest = () =>{
        setModalVisible(false);
        setSelectedRequest(null);
    }

    const acceptRequest = async() => {
        if (selectedRequest) {
            const {
                requestId,
                status,
                geo1,
                geo2,
                type,
            } = selectedRequest;
            if (status == 0) {
                if (currentLocation) {
                    if (type == 2) {
                        const origin = `${currentLocation.latitude.toFixed(6)},${currentLocation.longitude.toFixed(6)}`;
                        const destination = `${geo2.latitude.toFixed(6)},${geo2.longitude.toFixed(6)}`;
                        const direction = await getDirections(origin, destination);
                        debugger
                        if (!direction) {
                            debugger
                            console.error("Get direction failed!");
                            return;
                        }
                        set(ref(firebaseDatabase, `direction/${userID}/${requestId}`), direction)
                            .then(async () => {
                                console.log("Direction update!.");
                                const userID = await getUserIDByTokken();
                                const requestRef = ref(firebaseDatabase, `request/${requestId}`);
                                update(requestRef, { requestStatus: userID })
                                    .then(() => {
                                        console.log("Accepted request! GOGOGO TIP!.");
                                    })
                                    .catch((error) => {
                                        console.error("Error updating request status: ", error);
                                    });
                            })
                            .catch((error) => {
                                console.error("Error updating direction: ", error);
                            });
                    }
                }
                else {
                    console.error("Current location is null!");
                }

            }
            else {
                alert("Request in process!");
            }
        }
        else{
            console.error("No request selected!");
        }
        setModalVisible(false);
        setSelectedRequest(null);
    }

    return <View style={{
        backgroundColor: 'white',
        flex: 1
    }}>
        <View style={{ height: normalize(95) }}>
            <View style={{
                marginHorizontal: split.s4,
                marginVertical: split.s5,
            }}>
                <Text style={{
                    color: primary,
                    fontSize: normalize(18),
                    fontWeight: 'bold',
                    padding: 10,
                }}>Request List</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary }} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: split.s3,
                marginTop: split.s4,
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
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCorrect={false}
                    style={{
                        backgroundColor: colors.inactive,
                        flex: 1,
                        height: normalize(36),
                        borderRadius: 5,
                        opacity: 0.6,
                        color: "black",
                        paddingStart: 30
                    }}
                />
                <Icon name={"bars"}
                    size={30}
                    color={"black"}
                    marginStart={5}
                />
            </View>
        </View>
        <View style={{
            height: normalize(80),
            //backgroundColor:'purple'
        }}>
            <View style={{ height: 1, backgroundColor: primary }} />
            <FlatList
                data={categories}
                horizontal={true}
                renderItem={({ item }) => <Category
                    category={item}
                    onPress={() => {
                        if(item.value==0){
                            setIsEnableMine(!isEnableMine);
                        }
                        else{
                            setTypeSelected(item.value==typeSelected?null:item.value);
                        }
                    }} />}
                style={{
                    flex: 1
                }} />
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        <Modal visible={modalVisible} animationType="fade" transparent={true}  >
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {modalVisible && selectedRequest && (
                    <View style={styles.container}>
                        <View style={{
                            flexDirection: 'row',
                            marginBottom: split.s4,
                        }}>
                            {selectedRequest.type == 2 && <Image
                                style={{
                                    width: normalize(130),
                                    height: normalize(130),
                                    resizeMode: 'cover',
                                    borderRadius: 15,
                                    marginRight: split.s3,
                                }}
                                source={{ uri: selectedRequest.url }}
                            />}
                            <View style={{
                                flex: 1,
                                //backgroundColor:'green',
                                marginRight: split.s3,
                            }}>
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                    fontWeight: 'bold'
                                }}>{selectedRequest.name}</Text>
                                <View style={{ height: 1, backgroundColor: 'black' }} />
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                }}>Price: {selectedRequest.price} vnd</Text>
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                }}>Mô tả: {selectedRequest.des}</Text>
                                {selectedRequest.type == 1 && <View>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Distance: {selectedRequest.direction.distance.text}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Duration: {selectedRequest.direction.duration.text}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Từ: {selectedRequest.direction.startAddress}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Tới: {selectedRequest.direction.endAddress}</Text>
                                </View>}
                            </View>

                        </View>
                        <View style={{ height: 1, backgroundColor: 'black' }} />
                        <FullMap
                            geo1={selectedRequest.geo1}
                            geo2={selectedRequest.geo2}
                            direction={selectedRequest.direction}
                            type={selectedRequest.type}
                            screen="ListRequest"
                        />
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
        {isEnableMine &&
            <View>
                <Text
                    style={{
                        color: primary,
                        alignSelf: 'center',
                        marginVertical: normalize(5),
                        fontSize: fontSizes.h3
                    }}
                >Your request</Text>
                <View style={{ height: 1, backgroundColor: primary }} />
            </View>
        }
        {filterRequest().length > 0 ? renderRequestList() : renderNotRequest()}
    </View>
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
export default RequestList