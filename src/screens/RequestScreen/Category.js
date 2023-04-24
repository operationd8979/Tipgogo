import React from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList } from "react-native"

const Category = (props) => {
    const {category,onPress} = props
    const {name,url} = category
    return <TouchableOpacity 
        onPress = {onPress}
        style={{
            alignItems:'center',
            margin:10,
    }}>
        <Image
            style={{
                width: 130,
                height: 60,
                resizeMode: 'cover',
                borderRadius: 20,
                marginBottom: 5
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