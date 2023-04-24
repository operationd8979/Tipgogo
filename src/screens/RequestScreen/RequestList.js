import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images } from "../../constants"
import RequestItem from "./RequestItem";
import Category from "./Category";
/** 
 - ListView from a map of objects
 - FlatList
 */
const RequestList = (props) => {
    //list of foods = state

    const {hitchhiking,secondHand,helpBuy} = images

    const [categories, setCategories] = useState([
        {
            name: 'Hitchhiking',
            url: hitchhiking
        },
        {
            name: 'Secondhand Stuff',
            url: secondHand
        },
        {
            name: 'Delivery',
            url: helpBuy
        },
        
    ])
    const [foods, setFoods] = useState([
        {
            name: 'Điện thoại quay số cũ',
            url: 'https://img.huffingtonpost.com/asset/5b9cc6b7240000310094d104.jpeg',
            status: 'available',
            price: "300.000",
            adress: '150 Xa Lộ Hà Nội, P.Thái Xanh, Quận 9',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                youtube: 'http://www.youtube.com/nghiatran__/',
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
        {
            name: 'Gách thuốc cũ thời Pháp',
            url: 'https://i.pinimg.com/550x/c2/a4/41/c2a44189e5a33701af152995022db62f.jpg',
            status: 'ended request',
            price: "0",
            adress: '95 Phạm Văn Đồng, P.13, Quận Gò Vấp',
            socialNetWorks: {
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
        {
            name: 'Máy ảnh phim cũ còn dùng được',
            url: 'https://publisher-ncreg.s3.us-east-2.amazonaws.com/pb-ncregister/swp/hv9hms/media/2020082620088_5f46a585c2bf74d8ccd7e5bajpeg.jpeg',
            status: 'on process',
            price: "1.200.000",
            adress: '90/12/1 Nam Xuân Hòa, P.Trung Mỹ Tây, Quận 12',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                youtube: 'http://www.youtube.com/nghiatran__/',
            },
        },
        {
            name: 'Đèn dầu nhà ông nội',
            url: 'https://i.pinimg.com/originals/c0/92/95/c092955257c361b2e90e9b7a434b484c.jpg',
            status: 'available',
            price: "400.000",
            adress: '56 Xa Lộ Hà Nội, P.16, Quận Gò Vấp',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
        {
            name: 'Xiên bẩn thơm tho',
            url: 'https://awol.com.au/wp-content/uploads/2019/11/30624445_2031384813783830_665928700650323968_n-copy.jpg',
            status: 'ended request',
            price: 5858.69,
            adress: '150 Xa Lộ Hà Nội, P.Thái Xanh, Quận 9',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
    ])

    const [searchText, setSearchText] = useState('')
    const filterFoods = useCallback(() => foods.filter(eachFood => eachFood.name.toLowerCase().includes(searchText.toLowerCase())))
    
    const renderNoFoodFound = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h2,
                    alignSelf: 'center',
                }}>
                    No Request found!
                </Text>
            </View>
        );
    };

    const renderFoodList = () => {
        return (
            <FlatList
                data={filterFoods()}
                renderItem={({ item }) => <RequestItem
                    onPress={() => {
                        alert(`you press item's name: ${item.name}`)
                    }}
                    food={item} />}
                keyExtractor={eachFood => eachFood.name}
            />
        );
    };

    return <View style={{
        backgroundColor: 'white',
        flex: 1
    }}>
        <View style={{ height: 100 }}>
            <Text style={{ color: 'black', alignSelf: 'center', fontSize: fontSizes.h2 }}>Request List</Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                marginTop: 5,
            }}>
                <Icon name={"search"}
                    size={20}
                    color={'black'}
                    marginStart={5}
                    style={{
                        position: 'absolute'
                    }}
                />
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCorrect={false}
                    style={{
                        backgroundColor: colors.inactive,
                        flex: 1,
                        height: 45,
                        borderRadius: 5,
                        opacity: 0.7,
                        color: 'black',
                        paddingStart: 30
                    }}
                />
                <Icon name={"bars"}
                    size={30}
                    color={'black'}
                    marginStart={5}
                />
            </View>
        </View>
        <View style={{
            height: 100,
            //backgroundColor:'purple'
        }}>
            <View style={{ height: 1, backgroundColor: colors.inactive }} />
            <FlatList
                data={categories}
                horizontal={true}
                renderItem={({ item }) => <Category
                    category={item}
                    onPress={() => {
                        alert(`you press item's name: ${item.name}`)
                    }} />}
                style={{
                    flex: 1
                }} />
            <View style={{ height: 1, backgroundColor: colors.inactive }} />
        </View>
        {/*<ScrollView>
            {foods.map(eachfood =><FoodItem food={eachfood} key={eachfood.name}/>)}
        </ScrollView>*/}
        {filterFoods().length > 0 ? renderFoodList() : renderNoFoodFound()}
    </View>
}
export default RequestList