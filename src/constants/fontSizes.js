import { Dimensions, Platform, PixelRatio } from 'react-native';

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

function normalize(size) {
  const newSize = size * scale 
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}

export default{
    h1 : normalize(22),
    h2: normalize(19),
    h3: normalize(16),
    h4: normalize(13),
    h5: normalize(10),
    m1: normalize(58),
    m2: normalize(50),
    m3: normalize(42),
    m4: normalize(34),
    m5: normalize(28),
}