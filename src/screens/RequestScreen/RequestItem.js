import React from "react";
import { Text, Image, View, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"

import { colors, fontSizes, icons, images, normalize , split } from "../../constants"

const RequestItem = ({ onPress, request: { name, url, price, des, geo, type, status, accepted } }) => {

    //debugger

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
        <Image 
            style={{
                width:normalize(130),
                height:normalize(130),
                resizeMode:'cover',
                borderRadius: 15,
                marginRight: split.s3,
            }}
            source={{uri:url}}
        />
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
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Price: {price} vnd</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Mô tả: {des}</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Adress: {geo.latitude+"-"+geo.longitude}</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h4,
            }}>Type: {type==1?"Hitchiking":type==2?"SecondHand":"Delivery"}</Text>
        </View>
    </TouchableOpacity>
}

export default RequestItem