import React, { useState, useEffect } from 'react';
import { Text, Image, View, ImageBackground, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
//component = function
//create a variable which reference to a function
import { images, icons, colors, fontSizes } from '../constants'
import { UIButton } from '../components'




function Welcome(props) {

    const {navigation,route} = props
    const {navigate,goBack} = navigation

    //state => when a state is changed => UI is reloaded
    //like getter/setter
    const { background } = images;
    const { primary } = colors;

    const options = [
        {lable:'Influncer',value:'1'},
        {lable:'Business',value:'2'},
        {lable:'Individual',value:'3'},
    ];
    
    const [selectedOption, setSelectedOption] = useState(null);
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
                    alignItems: 'center'
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: fontSizes.h2,
                        fontWeight: 'bold'
                    }}>LogoCompany.co</Text>
                    <View style={{ flex: 1 }} />
                    <Icon name={'question-circle'}
                        color={'white'}
                        size={20}
                        style={{
                            marginEnd: 20
                        }}
                    />
                    {/*<Image source={icons.question}
                        style={{
                            width: 25,
                            height: 25,
                            tintColor: 'white',
                            marginEnd: 10
                        }}
                    />*/}
                </View>
            </View>
            <View style={{
                flex: 25,
                //backgroundColor: 'blue',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text style={{
                    marginBottom: 7,
                    color: 'white',
                    fontSize: fontSizes.h4
                }}>Welcome to</Text>
                <Text style={{
                    marginBottom: 7,
                    color: 'white',
                    fontSize: fontSizes.h3,
                    fontWeight: 'bold'
                }}>TipGoCompany.CO!</Text>
                <Text style={{
                    marginBottom: 7,
                    color: 'white',
                    fontSize: fontSizes.h4
                }}>Please select your account type</Text>
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
                        onPress={() => setSelectedOption(option.value)}
                    />)}
            </View>
            <View style={{
                flex: 20,
                //backgroundColor: 'purple'
            }}>
                <UIButton 
                    onPress={()=> navigate('UItab')}
                    title={'login'.toUpperCase()} 
                />
                <TouchableOpacity 
                    onPress={()=>{
                        alert('bấm đăng ký');
                    }}
                    style={{
                        padding:5
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: fontSizes.h5,
                        alignSelf: 'center',
                    }}>Want to register new Account ?</Text>
                    <Text style={{
                        color: primary,
                        fontSize: fontSizes.h5,
                        alignSelf: 'center',
                        textDecorationLine: 'underline'
                    }}>Register</Text>
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

