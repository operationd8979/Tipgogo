import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images } from "../../constants"
import FoodItem from "./FoodItem";
import Category from "./Category";
/** 
 - ListView from a map of objects
 - FlatList
 */
const FoodList = (props) => {
    //list of foods = state
    const [categories, setCategories] = useState([
        {
            name: 'Chocolate',
            url: 'https://health.clevelandclinic.org/wp-content/uploads/sites/3/2015/03/chocolateWhiteDark-454384771-770x533-1-650x428.jpg'
        },
        {
            name: 'Juice',
            url: 'https://insanelygoodrecipes.com/wp-content/uploads/2021/10/Delicious-Fruit-Juices-Orange-Kiwi-and-Strawberry.jpg'
        },
        {
            name: 'Metal',
            url: 'https://img.freepik.com/premium-photo/metal-steel-plate-texture-background_293060-5312.jpg'
        },
        {
            name: 'Dried food',
            url: 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/01/dried-fruit-nuts-raisins-1296x728-header-1296x728.jpg'
        },
        {
            name: 'Water',
            url: 'https://www.eatingwell.com/thmb/qtP5zJfjZjS_6lkAGjOoH2XDNEc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/mineral-water-8cc11cec12c7471bac9378fa9757c83f.jpg'
        },
        {
            name: 'Pokemon',
            url: 'https://images2.thanhnien.vn/Uploaded/phongdt/2022_05_11/pokemon-4968.png'
        },
    ])
    const [foods, setFoods] = useState([
        {
            name: 'Bún chả Hà Nội, nấu nước lèo Thái Lan, kết hợp ớt bột Quảng Ninh',
            url: 'https://img.freepik.com/premium-vector/fast-food-illustration-set_121223-1482.jpg',
            status: 'Comming soon',
            price: 9897.556,
            website: 'https://edition.cnn.com',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                youtube: 'http://www.youtube.com/nghiatran__/',
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
        {
            name: 'Bánh cuốn Bình Định',
            url: 'https://web-assets.bcg.com/3c/3d/794ddde7481695d246407d66e179/food-for-thought-the-untapped-climate-opportunity-in-alternative-proteins-rectangle.jpg',
            status: 'Opening now',
            price: 5452.56,
            website: 'https://edition.cnn.com',
            socialNetWorks: {
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
        {
            name: 'Chả cá nướng',
            url: 'https://hips.hearstapps.com/hmg-prod/images/blooming-quesadilla-ring-1674080631.jpeg',
            status: 'Comming soon',
            price: 12124.56,
            website: 'https://edition.cnn.com',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                youtube: 'http://www.youtube.com/nghiatran__/',
            },
        },
        {
            name: 'Xiên bẩn thơm tho',
            url: 'https://awol.com.au/wp-content/uploads/2019/11/30624445_2031384813783830_665928700650323968_n-copy.jpg',
            status: 'Closing soon',
            price: 5858.69,
            website: 'https://edition.cnn.com',
            socialNetWorks: {
                facebook: 'http://www.facebook.com/duypham',
                instagram: 'http://www.instagram.com/nghiatran__/',
            },
        },
    ])

    const [searchText, setSearchText] = useState('')
    const filterFoods = useCallback(() => foods.filter(eachFood => eachFood.name.toLowerCase().includes(searchText.toLowerCase())))
    {/* nếu dùng Memo 
    const filteredFoods = useMemo(() => {
        return foods.filter((eachFood) =>
            eachFood.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [foods, searchText]);
    */}
    
    const renderNoFoodFound = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h2,
                    alignSelf: 'center',
                }}>
                    No food found
                </Text>
            </View>
        );
    };

    const renderFoodList = () => {
        return (
            <FlatList
                data={filterFoods()}
                renderItem={({ item }) => <FoodItem
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
            <Text style={{ color: 'black', alignSelf: 'center', fontSize: fontSizes.h2 }}>FoodList</Text>
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
                        opacity: 0.8,
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
export default FoodList