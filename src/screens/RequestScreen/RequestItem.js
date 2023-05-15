import React, {useRef, useState} from "react";
import { Text, Image, View, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"

import { colors, fontSizes, icons, images, normalize , split } from "../../constants"
import useMap from '../FullMap/FullMap'


const RequestItem = ({ onPress, request: { name, url, price, des, geo1, geo2 , type, status, accepted, direction } }) => {



    const {FullMap} = useMap();

    function _getColorFromStatus(status){
        switch (status) {
            case 0:
              return colors.success;
            case 1:
              return colors.zalert;
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
            flexDirection:'row'
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
            <FullMap
                geo1={geo1}
                geo2={geo2}
                type={type}
                screen="RequestList"
                lite={true}
            />
        </View>}
        <View style={{
            flex:1,
            //backgroundColor:'green',
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
                }}>{accepted? "<ONING YOU>" :status==0?"AVAILABLE":status==1?"ENDED":"ON PROCESS"}</Text>
            </View>
            <Text style={{
                    color: "red",
                    fontSize: fontSizes.h4,
                    fontWeight: 'bold',
            }}>Price: {price} vnd</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Mô tả: {des}</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Adress: {direction? `${direction.startAddress}` :`${geo1.latitude}-${geo1.longitude}`}</Text>
            {/* <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Type: {type==1?"Hitchiking":type==2?"SecondHand":"Delivery"}</Text> */}
        </View>
    </TouchableOpacity>
}

export default RequestItem