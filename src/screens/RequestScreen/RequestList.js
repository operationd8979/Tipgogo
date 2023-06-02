import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList, Modal, StyleSheet, ActivityIndicator } from "react-native"
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { distanceTwoGeo, formatNumber } from '../../utilies'
import {getDirectionDriver} from '../../service/MapService'


const getUserIDByTokken = async () => {
    const accessToken = await AsyncStorage.getItem('token');
    const dbRef = ref(firebaseDatabase, "users");
    const dbQuery = query(dbRef, orderByChild("accessToken"), equalTo(accessToken));
    const data = await get(dbQuery);
    const userID = Object.keys(data.val())[0];
    return userID;
}

const WaitingScreen = () => {
    return (
        <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{
                color: 'black',
            }}>
                Waiting for location...</Text>
            <Image source={images.logo} style={{ height: normalize(200), width: normalize(200) }} />
        </View>
    );
};

const RequestList = (props) => {

    const [typeSelected, setTypeSelected] = useState(null);
    const [onAvaiable, setOnAvaiable] = useState(true);
    const [optionSort, setOptionSort] = useState(false);
    //constant
    const { hitchhiking, secondHand, helpBuy } = images
    const { primary, zalert, success, warning, inactive } = colors
    const [categories, setCategories] = useState([
        {
            name: 'Hitchhiking',
            url: hitchhiking,
            value: 1,
        },
        {
            name: 'Secondhand Stuff',
            url: secondHand,
            value: 2,
        },
        // {
        //     name: 'Your Request',
        //     url: helpBuy,
        //     value: 0,
        // },
    ])

    //element init
    const { navigation } = props
    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

    //element function
    const [modalVisible, setModalVisible] = useState(false);
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [searchText, setSearchText] = useState('')
    const filterRequest = useCallback(() => requests.filter(eachRequest =>
        eachRequest.name.toLowerCase().includes(searchText.toLowerCase())
        && (onAvaiable|| eachRequest.accepted)
        && (typeSelected == null || eachRequest.type == typeSelected))
        .sort((a, b) => {
            if (optionSort) {
                const distanceA = distanceTwoGeo(currentLocation, a.type === 1 ? a.geo1 : a.geo2);
                const distanceB = distanceTwoGeo(currentLocation, b.type === 1 ? b.geo1 : b.geo2);
                if (distanceA < distanceB)
                    return -1;
                else
                    return 1;
            }
            else {
                if (a.timestamp > b.timestamp)
                    return -1;
                else
                    return 1;
            }
        })
        , [searchText, typeSelected, requests, optionSort])

    useEffect(() => {
        console.log("__________Init listRequest__________");
        checkLocationPermission();
        getCurrentPosition();
    }, [])

    useEffect(() => {
        const dbRef = ref(firebaseDatabase, 'request')
        const unsubscribe = onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('Importing data to listRequest (RequestList)')
                setOnAvaiable(true);
                const userID = await getUserIDByTokken();
                let snapshotObject = snapshot.val()
                setRequests(Object.keys(snapshotObject)
                    .filter(k => snapshotObject[k].requestStatus != -1)
                    .filter(k => k.split('-')[0] != userID)
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
                            address: eachObject.address,
                            direction: eachObject.direction,
                            accepted: userID == eachObject.requestStatus,
                            timestamp: eachObject.timestamp,
                            time: time,
                        }
                    }))
            } else {
                console.log('No data available')
            }
        })
        return unsubscribe;
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
                        handleTapRequest(item);
                    }}
                    screen="RequestList"
                    request={item}
                    currentLocation={currentLocation}
                />}
                keyExtractor={eachRequest => eachRequest.requestId}
            />
        );
    };

    const handleTapRequest = async (item) => {
        if (item.accepted) {
            console.log("1");
            navigation.navigate("RequestDetail", { request: item });
        }
        else {
            console.log("2");
            setSelectedRequest(item);
            setModalVisible(true);
        }
    }

    const handleCloseRequest = () => {
        setModalVisible(false);
        setSelectedRequest(null);
    }

    const acceptRequest = async () => {
        if (selectedRequest) {
            const {
                requestId,
                status,
                geo1,
                geo2,
                type,
            } = selectedRequest;
            const userID = await getUserIDByTokken();
            if (status == 0) {
                if (currentLocation && userID) {
                    if (type === 2 || true) {
                        let destination = "";
                        let direction = null;
                        if (type === 1)
                            destination = geo1;
                        if (type === 2)
                            destination = geo2;
                        if (destination != "")
                            direction = await getDirectionDriver(currentLocation, destination);
                        if (!direction) {
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
        else {
            console.error("No request selected!");
        }
        setModalVisible(false);
        setSelectedRequest(null);
    }

    return currentLocation ? <View style={{
        backgroundColor: 'white',
        flex: 1
    }}>
        <View style={{ height: normalize(95) }}>
            <View style={{
                paddingHorizontal: split.s4,
                paddingVertical: split.s5,
                backgroundColor: primary
            }}>
                <Text style={{
                    color: "white",
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
                    onPress={() => setSortModalVisible(!sortModalVisible)}
                />
                <Modal visible={sortModalVisible} animationType="fade" transparent={true}>
                    <TouchableOpacity
                        onPress={()=>{setSortModalVisible(false)}}
                        style={{
                            flex:1,
                            //backgroundColor:'green'
                        }}
                    />
                    <View style={{
                        backgroundColor:"green",
                        position:'absolute',
                        width: 200,
                        right: 0,
                        top: 110,
                        borderWidth: 1,
                    }}>
                        <TouchableOpacity style={{
                            height:25,
                            flexDirection:'row',
                            alignItems:'center',
                            paddingStart: 5,
                            backgroundColor: optionSort? 'white' : primary
                            }}
                            onPress={() => {
                                setOptionSort(false);
                                setSortModalVisible(false);
                            }}
                        >
                            <Icon name="history" color={optionSort? inactive : "white"}/>
                            <Text style={{color: optionSort? inactive : "white"}}>  Sắp xếp theo thời gian</Text>
                        </TouchableOpacity>
                        
                        <View style={{height:1,backgroundColor:"black"}} />

                        <TouchableOpacity style={{
                            height:25,
                            flexDirection:'row',
                            alignItems:'center',
                            paddingStart: 5,
                            backgroundColor: optionSort? primary : 'white'
                            }}
                            onPress={() => {
                                setOptionSort(true);
                                setSortModalVisible(false);
                            }}
                        >
                            <Icon name="shoe-prints" color={optionSort? "white" : inactive}/>
                            <Text style={{color: optionSort? "white" : inactive}}>  Sắp xếp theo khoảng cách</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
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
                        if (onAvaiable) {
                            setTypeSelected(item.value == typeSelected ? null : item.value);
                        }
                    }} />}
                style={{
                    flex: 1
                }} />
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        <Modal visible={modalVisible} animationType="fade" transparent={true}  >
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {selectedRequest && (
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
                                }}>Price: {formatNumber(selectedRequest.price)} vnd</Text>
                                {selectedRequest.type == 2 &&<View>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Address: {selectedRequest.address}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Thời gian: {selectedRequest.time} </Text>
                                </View>}
                                {selectedRequest.type == 1 && <View>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Distance: {Math.ceil(selectedRequest.direction.distance/10)/100} km</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Duration: {Math.ceil(selectedRequest.direction.duration/60)} phút</Text>
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
                        {selectedRequest.des && <View>
                            <Text style={{
                                color: 'black',
                                fontSize: fontSizes.h4,
                            }}>Mô tả: {selectedRequest.des}</Text>
                        </View>}
                        <View style={{ height: 1, backgroundColor: 'black' }} />
                        <FullMap
                            geo1={selectedRequest.type==1&&selectedRequest.geo1}
                            geo2={selectedRequest.geo2}
                            direction={selectedRequest.direction}
                            type={selectedRequest.type}
                            screen="ModalRequestList"
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
        {filterRequest().length > 0 ? renderRequestList() : renderNotRequest()}
    </View> : <WaitingScreen />
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