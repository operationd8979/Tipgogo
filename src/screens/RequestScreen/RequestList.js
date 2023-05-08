import React, { useState, useEffect, useCallback } from "react";
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
} from "../../../firebase/firebase"
import useMap from '../FullMap/FullMap'

import AsyncStorage from '@react-native-async-storage/async-storage'
/** 
 - ListView from a map of objects
 - FlatList
 */
const RequestList = (props) => {

    const {
        checkLocationPermission,
        getCurrentPosition,
        FullMap,
        currentLocation,
        setCurrentLocation,
        geo1,
        setGeo1,
        geo2,
        setGeo2,
    } = useMap();

    let token1 = AsyncStorage.getItem("token");

    const { hitchhiking, secondHand, helpBuy } = images

    const { primary, zalert, success, warning, inactive } = colors

    const [categories, setCategories] = useState([
        {
            name: 'Hitchhiking',
            url: hitchhiking
        },
        {
            name: 'Secondhand Stuff',
            url: secondHand
        },
        {
            name: 'Delivery',
            url: helpBuy
        },

    ])

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [requests, setRequests] = useState([]);

    useEffect(() => {
        checkLocationPermission();
        getCurrentPosition();
        const dbRef = ref(firebaseDatabase, 'request') 
        onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                let snapshotObject = snapshot.val()
                setRequests(Object.keys(snapshotObject)
                    .map(eachKey => {
                        let eachObject = snapshotObject[eachKey]
                        return {
                            //default profile url
                            requestId: eachKey,
                            name: eachObject.title,
                            url: eachObject.photo,
                            status: eachObject.requestStatus,
                            price: eachObject.price,
                            type: eachObject.typeRequest,
                            des: eachObject.des,
                            geo: eachObject.geo1,
                        }
                    }))
            } else {
                console.log('No data available')
            }
        })
    }, [])

    const [searchText, setSearchText] = useState('')
    const filterRequest = useCallback(() => requests.filter(eachRequest => eachRequest.name.toLowerCase().includes(searchText.toLowerCase())))

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
                        setSelectedRequest(item);
                        setModalVisible(true);
                        console.log(item.url)
                    }}
                    request={item} />}
                keyExtractor={eachRequest => eachRequest.requestId}
            />
        );
    };

    

    return <View style={{
        backgroundColor: 'white',
        flex: 1
    }}>
        <View style={{ height: 100 }}>
            <View style={{
                marginHorizontal: 5
            }}>
                <Text style={{
                    color: 'black',
                    fontSize: normalize(18),
                    fontWeight: 'bold',
                    padding: 10
                }}>Request List</Text>
                <View style={{ height: 1, backgroundColor: primary }} />
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                marginTop: 5,
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
                        height: 45,
                        borderRadius: 5,
                        opacity: 0.6,
                        color: 'black',
                        paddingStart: 30
                    }}
                />
                <Icon name={"bars"}
                    size={30}
                    color={primary}
                    marginStart={5}
                />
            </View>
        </View>
        <View style={{
            height: 100,
            //backgroundColor:'purple'
        }}>
            <View style={{ height: 1, backgroundColor: primary }} />
            <FlatList
                data={categories}
                horizontal={true}
                renderItem={({ item }) => <Category
                    category={item}
                    onPress={async () => {
                        let stringUser = await AsyncStorage.getItem("token")
                        alert(`you press item's name: ${stringUser}`)
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
                            <Image
                                style={{
                                    width: 150,
                                    height: 150,
                                    resizeMode: 'cover',
                                    borderRadius: 15,
                                    marginRight: 15
                                }}
                                source={{ uri: selectedRequest.url }}
                            />
                            <View style={{
                                flex: 1,
                                //backgroundColor:'green',
                                marginRight: 10
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
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                }}>Type: {selectedRequest.type == 1 ? "Hitchiking" : selectedRequest.type == 2 ? "SecondHand" : "Delivery"}</Text>
                            </View>
                            
                        </View>
                        <View style={{ height: 1, backgroundColor: 'black' }} />
                        <FullMap geo1={selectedRequest.geo}/>

                    </View>
                    /*requestId: eachKey,
                            name: eachObject.title,
                            url: eachObject.photo,
                            status: eachObject.requestStatus,
                            price: eachObject.price,
                            type: eachObject.typeRequest,
                            des: eachObject.des,
                            geo: eachObject.geo1,

                    onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled,height
                    */
                )}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <CLButton title="Accept" sizeBT={"35%"} onPress={() => setModalVisible(false)} />
                    <CLButton title="Close Modal" sizeBT={"35%"} onPress={() => setModalVisible(false)} />
                </View>
            </View>
        </Modal>
        {filterRequest().length > 0 ? renderRequestList() : renderNotRequest()}
    </View>
}


const styles = StyleSheet.create({
    container: {
        height: 400,
        width: "90%",
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignSelf: 'center',
        padding: split.s4,
        borderWidth: 1,
        borderColor: 'black',
    },
});
export default RequestList