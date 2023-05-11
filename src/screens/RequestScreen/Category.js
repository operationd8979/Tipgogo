import React from "react";
import { Text, Image, View, TouchableOpacity } from "react-native"
import {split,fontSizes, normalize} from "../../constants"

const Category = (props) => {
    const {category,onPress} = props
    const {name,url} = category
    return <TouchableOpacity 
        onPress = {onPress}
        style={{
            alignItems:'center',
            margin: normalize(9),
    }}>
        <Image
            style={{
                width: normalize(100),
                height: normalize(48),
                resizeMode: 'cover',
                borderRadius: 35,
                marginBottom: normalize(4),
            }}
            source={url}
        />
        <Text 
            style={{color:'black',
            fontWeight:'bold',
        }}>
            {name}
        </Text>
    </TouchableOpacity>
}
export default Category