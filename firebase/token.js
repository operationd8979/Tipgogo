import Credentials from '../Credentials'
import axios from 'axios';
import {auth} from '../firebase/firebase'
const apiKey = Credentials.APIKey_Firebase;
const projectId = Credentials.projectId;

const get_id_token = async (refresh_token) => {
    try {
        const apiUrl = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
        const requestBody = {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        };
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        });
        if (response){
            tokenId = response.data.id_token;
            console.log('Get id token successfully:', tokenId);
            return tokenId;
        }
    } catch (error) {
        console.error('Error get id token:', error);
    }
}

const get_custom_token = async (id_token)=> {
    try {
        const url = `https://us-central1-${projectId}.cloudfunctions.net/create_custom_token?id_token=${id_token}`;
        const response = await axios.get(url);
        if (response){
            customToken = response.data.custom_token;
            console.log('Get custom token successfully:', customToken);
            return customToken;
        }
    } catch (error) {
        console.error('Error get custom token:', error);
    }
}

export {
    get_id_token,
    get_custom_token,
}