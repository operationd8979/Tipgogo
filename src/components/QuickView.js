import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { colors, fontSizes, normalize, split } from '../constants'
import {CLButton} from '.'
import Icon from 'react-native-vector-icons/FontAwesome5'
import useMap from '../screens/FullMap/FullMap'
import {formatNumber} from '../utilies'

const QuickView = (props) => {

    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();
    const {selectedRequest} = props;

    useEffect(() => {
        checkLocationPermission();
        getCurrentPosition();
    }, [])

    return <View style={styles.container}>
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
        screen="ModalRequest"
    />
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

export default QuickView;