import React, { useState, useEffect, useCallback } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images } from "../../constants"
import PropTypes from 'prop-types';


const ProductList = (props) => {

    const { primary, alert, warning, success, inactive } = (colors)

    const [products, setProducts] = useState([
        {
            name: 'Xiaomi Redmi Note 12',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/g/t/gtt_7766_3__1.jpg',
            price: 300,
            review: 160,
            rate: 4.6,
            like: false,
            specialization: [
                'RAM 4gb', 'ROM 128gb', 'Screen 6in'
            ]
        },
        {
            name: 'Samsung Galaxy S23 Ultra 256GB',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/s/2/s23-ultra-tim.png',
            price: 1300,
            review: 122,
            rate: 4.2,
            like: false,
            specialization: [
                'RAM 8gb', 'ROM 256gb', 'Screen 7in'
            ]
        },
        {
            name: 'iPhone 14 Pro Max 128GB',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/t/_/t_m_18.png',
            price: 1100,
            review: 69,
            rate: 3.8,
            like: false,
            specialization: [
                'RAM 6gb', 'ROM 128gb', 'Screen 6.5in'
            ]
        },
        {
            name: 'vivo Y35',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/2/_/2_282.jpg',
            price: 390,
            review: 156,
            rate: 4.5,
            like: false,
            specialization: [
                'RAM 8gb', 'ROM 128gb', 'Screen 6in'
            ]
        },
        {
            name: 'OPPO Find N2 Flip',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/n/2/n2_flip_-_combo_product_-_black.png',
            price: 980,
            review: 34,
            rate: 4.8,
            like: false,
            specialization: [
                'RAM 8gb', 'ROM 256gb', 'Screen 6.8in'
            ]
        },
        {
            name: 'Xiaomi Redmi Note 12',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/g/t/gtt_7766_3__1.jpg',
            price: 650,
            review: 111,
            rate: 2.8,
            like: false,
            specialization: [
                'RAM 4gb', 'ROM 128gb', 'Screen 6in'
            ]
        },
        {
            name: 'Samsung Galaxy S23 Ultra 256GB',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/s/2/s23-ultra-tim.png',
            price: 1100,
            review: 155,
            rate: 4.33,
            like: false,
            specialization: [
                'RAM 8gb', 'ROM 256gb', 'Screen 7in'
            ]
        },
        {
            name: 'iPhone 14 Pro Max 128GB',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/t/_/t_m_18.png',
            price: 650,
            review: 265,
            rate: 4.11,
            like: false,
            specialization: [
                'RAM 6gb', 'ROM 128gb', 'Screen 6.5in'
            ]
        },
        {
            name: 'vivo Y35',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/2/_/2_282.jpg',
            price: 490,
            review: 396,
            rate: 4.4,
            like: false,
            specialization: [
                'RAM 8gb', 'ROM 128gb', 'Screen 6in'
            ]
        },
        {
            name: 'OPPO Find N2 Flip',
            url: 'https://cdn2.cellphones.com.vn/358x358,webp,q100/media/catalog/product/n/2/n2_flip_-_combo_product_-_black.png',
            price: 1000,
            review: 30,
            rate: 4.3,
            like: false,
            specialization: [
                'RAM 8gb', 'ROM 256gb', 'Screen 6.8in'
            ]
        },
    ])

    StarRating.propTypes = {
        disabled: PropTypes.bool,
        emptyStar: PropTypes.string,
        fullStar: PropTypes.string,
        halfStar: PropTypes.string,
        iconSet: PropTypes.string,
        maxStars: PropTypes.number,
        rating: PropTypes.number,
        selectedStar: PropTypes.func,
        starColor: PropTypes.string,
        starSize: PropTypes.number,
    };

    const handleLikeProduct = (index) => {
        const newProduct = [...products];
        newProduct[index].like = newProduct[index].like == true ? false : true;
        setProducts(newProduct);
    }

    const handleRatingPress = (index, rating) => {
        const newProducts = [...products];
        newProducts[index].rate = rating;
        setProducts(newProducts);
      };

    return <FlatList
        data={products}
        keyExtractor={item => item.review}
        numColumns={2}
        style={{
            marginVertical: 10
        }}
        renderItem={({ item, index }) => <View style={{
            //backgroundColor: 'red',
            borderWidth: 1,
            flex: 1,
            borderColor: 'black',
            borderRadius: 25,
            margin: 5
        }}>
            <View
                style={{
                    margin: 5,
                    flexDirection: 'row',
                }}
            >
                <Image
                    source={{ uri: item.url }}
                    style={{
                        height: 100,
                        resizeMode: 'cover',
                        flex: 2.5,
                        borderRadius: 25
                    }}

                />
                <Text
                    style={{
                        flex: 1.5,
                        fontSize: fontSizes.h3,
                        marginHorizontal: 5,
                        fontWeight: 'bold',
                        color: success,
                    }}
                >
                    ${item.price}
                </Text>
            </View>
            <View
                style={{
                    margin: 5,
                    flex: 3
                }}
            >
                <Text style={{
                    color: primary,
                    fontWeight: 'bold',
                    fontSize: fontSizes.h3,
                }}>
                    {item.name}
                </Text>
                {item.specialization.map(eachSpecial => <Text key={eachSpecial}>*{eachSpecial}</Text>)}
            </View>
            <View style={{
                marginHorizontal: 5,
                marginBottom: 10,
                flexDirection: 'row',
                flex: 1,
            }}>
                <TouchableOpacity
                    onPress={() => handleLikeProduct(index)}
                    style={{
                        marginHorizontal: 5,
                        flexDirection: 'row',
                        flex: 1
                    }}>
                    <Icon
                        size={30}
                        name={item.like ? "heart" : "heart"}
                        color={item.like ? "red" : inactive} />
                    <Text style={{
                        color: item.like ? "red" : inactive,
                        fontSize: fontSizes.h5,
                        marginStart: 5
                    }}>Save for later</Text>
                </TouchableOpacity>
                <View style={{
                    //marginStart:20,
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}>

                    <Text style={{ color: 'blue', fontSize: fontSizes.h5 }}>{item.review} reviews</Text>
                </View>
            </View>
        </View>
        } />
}

export default ProductList