import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList, Modal, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import RequestItem from "./RequestItem";
import {
    firebaseDatabase,
    ref,
    onValue,
} from "../../../firebase/firebase"
import useMap from '../FullMap/FullMap'
import {getUserIDByTokken} from '../../service/UserService'


const MyRequestList = (props) => {

    //constant
    const { primary, zalert, success, warning, inactive } = colors

    //element init
    const { navigation } = props
    const { FullMap, currentLocation, getCurrentPosition,checkLocationPermission } = useMap();

    //element function
    const [requests, setRequests] = useState([]);
    const [searchText, setSearchText] = useState('')
    const filterRequest = useCallback(() => requests.filter(eachRequest => 
        eachRequest.name.toLowerCase().includes(searchText.toLowerCase()))
    ,[searchText,requests])


    useEffect(() => {
        console.log("__________Init listRequest__________");
        checkLocationPermission();
        getCurrentPosition();
        const dbRef = ref(firebaseDatabase, 'request') 
        const unsubscribe = onValue(dbRef, async (snapshot) => {
            if (snapshot.exists()) {
                console.log('Importing data to listRequest (MyRequestList)')
                const userID = await getUserIDByTokken();
                let snapshotObject = snapshot.val()
                setRequests(Object.keys(snapshotObject).filter(k=>k.split('-')[0]==userID)
                    .sort((a, b) => {
                        const timestampA = snapshotObject[a].timestamp;
                        const timestampB = snapshotObject[b].timestamp;
                        if (timestampA < timestampB) {
                        return 1;
                        }
                        if (timestampA > timestampB) {
                        return -1;
                        }
                        return 0;
                    })
                    .map(eachKey => {
                        let eachObject = snapshotObject[eachKey];
                        const time = new Date(eachObject.timestamp).toLocaleString();
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
                            accepted: userID==eachObject.requestStatus,
                            timestamp: eachObject.timestamp,
                            time : time,
                            mine: true,
                        }
                    }))
            } else {
                console.log('No data available')
            }
        })
        return unsubscribe;
    }, [])

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
                    screen="MyRequestList"
                    request={item} 
                    currentLocation={currentLocation}
                    />}
                keyExtractor={eachRequest => eachRequest.requestId}
            />
        );
    };

    const handleTapRequest = async(item) =>{
        if(item.status!=-1){
            navigation.navigate("MyRequest",{request:item});  
        } 
        else{
            console.log("Your request was canceled!");
        }
    }


    return <View style={{
        backgroundColor: 'white',
        flex: 1
    }}>
        <View style={{ height: normalize(95) }}>
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
            </View>
        </View>
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
export default MyRequestList