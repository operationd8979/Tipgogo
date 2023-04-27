import React, { useState, useEffect } from 'react';
import { Text, Image, View, ImageBackground, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
//component = function
//create a variable which reference to a function
import i18n from '../../i18n'
import { images, icons, colors, fontSizes } from '../constants'
import { UIButton } from '../components'

import {
    auth,
    onAuthStateChanged,
} from "../../firebase/firebase"

import AsyncStorage from '@react-native-async-storage/async-storage'

function Welcome(props) {

    const {navigation,route} = props
    const {navigate,goBack} = navigation

    //state => when a state is changed => UI is reloaded
    //like getter/setter
    const { background } = images;
    const { primary } = colors;

    const options = [
        {lable: i18n.t('w_item1'),value: 1},
        {lable: i18n.t('w_item2'),value: 2},
        {lable: i18n.t('w_item3'),value: 3},
    ];
    
    const [selectedOption, setSelectedOption] = useState(1);



    return <View style={{
        backgroundColor: 'white',
        flex: 100
    }}>
        <ImageBackground
            source={
                background
            } resizeMode='cover'
            style={{
                flex: 100,
            }}>
            <View style={{
                flex: 10,
                //backgroundColor: 'green',
            }}>
                <View style={{
                    flexDirection: 'row',
                    height: 50,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginStart: 10,
                }}>
                    
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h2,
                        fontWeight: 'bold'
                    }}>TipGogo.co</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name={'question-circle'}
                        color={'black'}
                        size={20}
                        style={{
                            marginEnd: 20
                        }}
                    />
                </View>
            </View>
            <View style={{
                flex: 25,
                //backgroundColor: 'blue',
                //justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{
                    marginBottom: 7,
                    color: 'black',
                    fontSize: fontSizes.h4
                }}>{i18n.t('welcome')}</Text>
                <Text style={{
                    marginBottom: 7,
                    color: 'black',
                    fontSize: fontSizes.h3,
                    fontWeight: 'bold'
                }}>TipGoCompany.CO!</Text>
                <Text style={{
                    marginBottom: 7,
                    color: 'black',
                    fontSize: fontSizes.h4
                }}>{i18n.t('w_descripstion')}</Text>
            </View>
            <View style={{
                flex: 40,
                //backgroundColor: 'purple'
            }}>
                {options.map(option =>
                    <UIButton 
                        key={option.value}
                        title={option.lable}
                        isSelected={selectedOption === option.value}
                        onPress={() => {
                            setSelectedOption(option.value)
                            i18n.locale = (option.value == 1? 'en': option.value == 2? 'vi' : 'jp')
                        }}
                        color={"rgba(255,255,255,0.8)"}
                    />)}
            </View>
            <View style={{
                flex: 20,
                //backgroundColor: 'purple'
            }}>
                <UIButton 
                    onPress={()=> navigate('Login')}
                    title={i18n.t('login').toUpperCase()} 
                />
                <TouchableOpacity 
                    onPress={()=>{
                        navigate('Register')
                    }}
                    style={{
                        padding:5
                }}>
                    <Text style={{
                        color: 'black',
                        fontSize: fontSizes.h5,
                        alignSelf: 'center',
                    }}>{i18n.t('w_desUnder')}</Text>
                    <Text style={{
                        color: primary,
                        fontSize: fontSizes.h5,
                        alignSelf: 'center',
                        textDecorationLine: 'underline'
                    }}>{i18n.t('register')}</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    </View>
}
export default Welcome

//import { sum2Number, substract2Number,PI } from '../utilies/Calculation';
//read object,variable,functions from other modules
/*
const Welcome = (props) =>{
    //destructuring an object
    const {x,y} = props
    const {person} = props
    //destructuring person object
    const {name,age,email} = person
    const {products} = props

    debugger
    //JSX
    //const => let => var
    return <View style={{
        
    }}>
        <Text>value of x = {x}, value of y = {y}</Text>
        <Text>Name = {name}, email = {email}, age = {age}</Text>
        {products.map(eachProducts => 
            <Text>{eachProducts.productName}, {eachProducts.year}</Text>)}
        <Text>sum 2 and 3 = {sum2Number(2,3)}</Text>
        <Text>10 - 8 = {substract2Number(10,8)}</Text>
        <Text>PI = {PI}</Text>
    </View>
}
*/

