import React, { useState } from "react"
import { View, Text, Switch,TouchableOpacity } from "react-native"
import { colors, fontSizes, icons, images, normalize } from "../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Dimensions } from 'react-native';

const Setting = (props) => {
    const { primary, inactive, success, warning, alert } = colors
    return <View style={{
        flex: 1,
        //backgroundColor:'purple'
    }}>
        <View style={{
            flex: 10,
            marginHorizontal: 5
        }}>
            <Text style={{
                color: 'black',
                fontSize: normalize(20),
                fontWeight: 'bold',
                padding: 10
            }}>Settings</Text>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>GROUPS</Text>
            <TouchableOpacity
                style={{
                    borderColor: primary,
                    borderWidth: 1,
                    height: 35,
                    width:'80%',
                    borderRadius: 10,
                    marginHorizontal: 17,
                    marginVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: primary
                }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    color: 'white',
                }}>Sign in with google</Text>
            </TouchableOpacity>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>SRCEEN TIME TRACKING</Text>
            <View style={{
                flexDirection:'row',
                margin:5,
                justifyContent:'center',
                alignItems:'center'
            }}>
                <Icon name='facebook' size={20}/>
                <Text style={{
                    fontSize: fontSizes.h5,
                    color: 'black',
                    marginStart: 5
                }}>Track while charging</Text>
                <View style={{flex:1}}/>
                <Switch/>
            </View>
        </View>
        <View style={{
            flex: 60,
            backgroundColor: 'purple'
        }}>

        </View>
    </View>
}

export default Setting

