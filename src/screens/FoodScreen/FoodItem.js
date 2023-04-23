import React from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"

import { colors, fontSizes, icons, images } from "../../constants"

const FoodItem = ({ onPress, food: { name, price, socialNetWorks, status, url, website } }) => {
    //debugger
    function _getColorFromStatus(status){
        switch (status.toLowerCase().trim()) {
            case "opening now":
              return colors.success;
            case "closing soon":
              return colors.alert;
            case "comming soon":
              return colors.warning;
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
                fontSize: fontSizes.h5,
                fontWeight: 'bold'
            }}>{name}</Text>
            <View style={{height:1,backgroundColor:'black'}}/>
            <View style={{
                flexDirection:'row'
            }}>
                <Text style={{
                    color:'black',
                    fontSize: fontSizes.h5,
                }}>status: </Text>
                <Text style={{
                    color: _getColorFromStatus(status),
                    fontSize: fontSizes.h5,
                }}>{status.toUpperCase()}</Text>
            </View>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h5,
            }}>Price: {price}$</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h5,
            }}>FoodType: Pizza</Text>
            <Text style={{
                    color:'black',
                    fontSize: fontSizes.h5,
            }}>Website: {website}</Text>
            <View style={{
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
            </View>
        </View>
    </TouchableOpacity>
}

export default FoodItem