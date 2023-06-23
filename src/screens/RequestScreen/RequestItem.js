import React, {useRef, useState, useEffect} from "react";
import { Text, Image, View, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"

import { colors, fontSizes, icons, images, normalize , split } from "../../constants"
import useMap from '../FullMap/FullMap'
import {formatNumber} from '../../utilies'


const RequestItem = ({ onPress, request: { name, url, price, des, geo1, geo2 , type, status, accepted, address, direction, mine, time}, currentLocation, screen }) => {

    const {FullMap} = useMap();

    function _getColorFromStatus(status){
        switch (status) {
            case 0:
              return colors.success;
            case 1:
              return colors.primary;
            case -1:
              return colors.zalert;
            default:
              return colors.warning;
          }
    }
    return <TouchableOpacity 
        onPress={onPress}
        style={{
            //backgroundColor:'purple',
            marginHorizontal: split.s3,
            marginTop: split.s3,
            flexDirection:'row',
            opacity: status==-1? 0.5 : 1,
    }}>
        {type===2&&<Image 
            style={{
                width:normalize(130),
                height:normalize(130),
                resizeMode:'cover',
                borderRadius: 15,
                marginRight: split.s3,
            }}
            source={{uri:url}}
        />}
        {type === 1 && <View style={{
            width: normalize(130),
            height: normalize(130),
            marginHorizontal: split.s5,
            marginVertical: split.s5,
        }}>
            {screen&&<FullMap
                geo1={type===1&&geo1}
                geo2={geo2}
                type={type}
                screen={screen}
                lite={true}
                locationFromItem = {currentLocation}
            />}
        </View>}
        <View style={{
            flex:1,
            marginRight: split.s5
        }}>
            <Text style={{
                color:'black',
                fontSize: fontSizes.h4,
                fontWeight: 'bold'
            }}>{name}</Text>
            <View style={{height:1,backgroundColor:'black'}}/>
            <View style={{
                flexDirection:'row',
                alignItems:'center'
            }}>
                <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
                }}>status: </Text>
                <Text style={{
                    color: accepted? colors.zalert : _getColorFromStatus(status),
                    fontSize: fontSizes.h4,
                }}>{accepted? "<ONING YOU>" :status==0?"AVAILABLE":status==-1?"ENDED":status==1?"[DONE]":"ON PROCESS"}</Text>
            </View>
            <Text style={{
                    color: price==0?colors.success:"red",
                    fontSize: fontSizes.h4,
                    fontWeight: 'bold',
            }}>Price: {price==0?'Free':`${formatNumber(price)} vnd`}</Text>
            {des&&<Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Mô tả: {des}</Text>}
            {/* <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Address: {type===1? `${direction.startAddress}` :`${address}`}</Text> */}
            {type===2&&<Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Address: {address}</Text>}
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Time: {time}</Text>
        </View>
    </TouchableOpacity>
}

export default RequestItem