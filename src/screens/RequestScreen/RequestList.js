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

import AsyncStorage from '@react-native-async-storage/async-storage'
/** 
 - ListView from a map of objects
 - FlatList
 */

const getUserIDByTokken= async () => {
    const accessToken = await AsyncStorage.getItem('token');
    const dbRef = ref(firebaseDatabase,"users");
    const dbQuery = query(dbRef,orderByChild("accessToken"),equalTo(accessToken));
    const data = await get(dbQuery);
    const userID = Object.keys(data.val())[0];
    return userID;
}

const RequestList = (props) => {

    
    //constant
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

    let token1 = AsyncStorage.getItem("token");

    //element init
    const { navigation } = props
    const { FullMap } = useMap();

    //element function
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [searchText, setSearchText] = useState('')
    const filterRequest = useCallback(() => requests.filter(eachRequest => eachRequest.name.toLowerCase().includes(searchText.toLowerCase())))

    useEffect(() => {
        console.log("__________Init listRequest__________");
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
                    request={item} />}
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
        if(item.accepted){
            navigation.navigate("RequestDetail",{request:item});
        }
        else{
            setSelectedRequest(item);
            setModalVisible(true); 
        } 
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
            } = selectedRequest;
            if (status == 0) {
                console.log(status);
                const userID = await getUserIDByTokken();
                const requestRef = ref(firebaseDatabase, `request/${requestId}`);
                update(requestRef, { requestStatus: userID })
                    .then(() => {
                        console.log("Accepted request! GOGOGO TIP!.");
                    })
                    .catch((error) => {
                        console.error("Error updating request status: ", error);
                    });
            }
            else{
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
        <View style={{ height: normalize(90) }}>
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
                <View style={{ height: 1, backgroundColor: primary }} />
            </View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: split.s3,
                marginTop: split.s6,
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
                            {selectedRequest.type==2&&<Image
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
                        />
                    </View>
                )}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <CLButton title="Accept" sizeBT={"35%"} height={normalize(30)} 
                    onPress={()=>acceptRequest()} />
                    <CLButton title="Close Modal" sizeBT={"35%"} height={normalize(30)} 
                    onPress={() => handleCloseRequest()} />
                </View>
            </View>
        </Modal>
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