import React from "react";
import { Text, Image, View, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"

import { colors, fontSizes, icons, images } from "../../constants"

const RequestItem = ({ onPress, request: { name, url, price, des, geo, type, status } }) => {

    //debugger

    function _getColorFromStatus(status){
        switch (status) {
            case 0:
              return colors.success;
            case 1:
              return colors.warning;
            case -1:
              return colors.zalert;
            default:
              return colors.success;
          }
    }
    return <TouchableOpacity 
        onPress={onPress}
        style={{
            height:180,
            //backgroundColor:'purple',
            paddingTop: 20,
            paddingStart: 10,
            flexDirection:'row'
    }}>
        <Image 
            style={{
                width:150,
                height:150,
                resizeMode:'cover',
                borderRadius: 15,
                marginRight:15
            }}
            source={{uri:url}}
        />
        <View style={{
            flex:1,
            //backgroundColor:'green',
            marginRight: 10
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
                    color: _getColorFromStatus(status),
                    fontSize: fontSizes.h4,
                }}>{status==0?"AVAILABLE":status==1?"ON PROCESS":"ENDED"}</Text>
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
            {/* <View style={{
                flexDirection:'row',
            }}>
                {
                    socialNetWorks['facebook'] != undefined && <Icon 
                    style={{paddingEnd: 5}}
                    name= 'facebook'
                    size={18} 
                    color={colors.inactive}/>
                }
                {
                    socialNetWorks['youtube'] != undefined && <Icon 
                    style={{paddingEnd: 5}}
                    name='youtube' 
                    size={18} 
                    color={colors.inactive}/>
                }
                {
                    socialNetWorks['instagram'] != undefined && <Icon 
                    name='instagram' 
                    size={18} 
                    color={colors.inactive}/>
                } 
            </View> */}
        </View>
    </TouchableOpacity>
}

export default RequestItem