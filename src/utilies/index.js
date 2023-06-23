import {distanceTwoGeo,findShortestPaths,calculateDistance,toRadians} from './mapCal'
import { emailRegex, passRegex, phoneRegex, nameRegex } from './regx'
import * as mapStyle from './mapStyle'
import {formatNumber} from './format'
import {sendSMS,phonecall} from './communication'
export{
    emailRegex,
    passRegex,
    phoneRegex,
    nameRegex,
    mapStyle,
    distanceTwoGeo,
    findShortestPaths,
    calculateDistance,
    toRadians,
    formatNumber,
    sendSMS,
    phonecall
}