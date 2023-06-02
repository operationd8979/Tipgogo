import axios from 'axios';
import Credentials from '../../Credentials'
import Openrouteservice from 'openrouteservice-js'
const orsDirections = new Openrouteservice.Directions({ api_key: Credentials.APIKey_OpenRouteService });
const Geocode = new Openrouteservice.Geocode({ api_key: Credentials.APIKey_OpenRouteService })


const getRouteDirection = (origin, destination) => {
    if (origin && destination)
        return new Promise(async (resolve, reject) => {
            console.log("API direction RUNNING...................!");
            try {
                let response = await orsDirections.calculate({
                    coordinates: [[origin.longitude, origin.latitude], [destination.longitude, destination.latitude]],
                    profile: 'driving-hgv',
                    restrictions: {
                        height: 10,
                        weight: 5
                    },
                    extra_info: ['waytype', 'steepness'],
                    avoidables: ['highways', 'tollways', 'ferries', 'fords'],
                    format: 'json'
                })
                const start = await getAddressFromLocation(origin.latitude, origin.longitude);
                const end = await getAddressFromLocation(destination.latitude, destination.longitude);
                const routes = response.routes;
                if (routes && routes.length > 0) {
                    const points = routes[0].geometry;
                    const decodedPoints = decodePolyline(points);
                    const direction = {
                        summary: `${start.address.road ? start.address.road : start.address.suburb}, ${start.address.city_district?start.address.city_district:start.address.city}-${end.address.road ? end.address.road : end.address.suburb}, ${end.address.city_district?end.address.city_district:end.address.city}-${response.metadata.timestamp}`,
                        startAddress: start.display_name,
                        endAddress: end.display_name,
                        distance: routes[0].summary.distance,
                        duration: routes[0].summary.duration,
                        steps: routes[0].segments[0].steps,
                        route: decodedPoints,
                        state: '0',
                        timestamp: response.metadata.timestamp,
                        destination: destination,
                    };
                    console.log("Direction OK! URL:", direction.summary);
                    resolve(direction);
                } else {
                    console.error('Error building directions!');
                    resolve(null);
                }
            } catch (err) {
                console.log("An error occurred: " + err.status)
                console.error(await err.response.json())
                reject(err);
            }
        });
    else
        return null;
};

const decodePolyline = (encodedPolyline) => {
    const polyline = require('@mapbox/polyline');
    const decoded = polyline.decode(encodedPolyline);
    return decoded.map((coordinate) => ({
        latitude: coordinate[0],
        longitude: coordinate[1],
    }));
};

const getAddressFromLocation = (latitude, longitude) => {
    if (latitude && longitude)
        return new Promise(async (resolve, reject) => {
            console.log("API reverseGeocode RUNNING...................!");
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                //https://nominatim.openstreetmap.org/search?format=json&q=${text}
                if (response.data && response.data.address) {
                    const address = response.data.address;
                    console.log('Address:', address);
                    resolve(response.data);
                }
                resolve(null);

            } catch (error) {
                console.log(error);
                reject(err);
            }
        });
    else
        return null;
};

const getLocationFromAddress = (address) => {
    if (address)
        return new Promise(async (resolve, reject) => {
            console.log("API reverseGeocode RUNNING...................!");
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
                );
                if(response){
                    resolve(response);
                }
                // if (response.data && response.data.address) {
                //     const address = response.data.address;
                //     console.log('Address:', address);
                //     resolve(response.data);
                // }
                resolve(null);

            } catch (error) {
                console.log(error);
                reject(err);
            }
        });
    else
        return null;
};



const getAddress = (latitude, longitude) => {
    if (latitude && longitude)
        return new Promise(async (resolve, reject) => {
            console.log("API reverseGeocode RUNNING...................!");
            try {
                let response_reverse = await Geocode.reverseGeocode({
                    point: { lat_lng: [latitude, longitude], radius: 50 },
                    boundary_country: ["DE"]
                })
                // Add your own result handling here
                console.log("response: ", response_reverse)
                resolve(response_reverse);

            } catch (err) {
                console.log("An error occurred: " + err.status)
                console.error(await err.response.json())
                reject(err);
            }
        });
    else
        return null;
};

const getDirections = (currentLocation, pressLocation) => {
    const origin = `${currentLocation.latitude.toFixed(6)},${currentLocation.longitude.toFixed(6)}`;
    const destination = `${pressLocation.latitude.toFixed(6)},${pressLocation.longitude.toFixed(6)}`;
    console.log("API direction RUNNING...................!");
    return new Promise(async (resolve, reject) => {
        try {
            console.log("API direction RUNNING...................!");
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/directions/json',
                {
                    params: {
                        origin: origin,
                        destination: destination,
                        key: GOOGLE_MAPS_APIKEY,
                    },
                }
            );
            const routes = response.data.routes;
            if (routes && routes.length > 0) {
                const points = routes[0].overview_polyline.points;
                const decodedPoints = decodePolyline(points);
                const direction = {
                    summary: routes[0].summary,
                    startAddress: routes[0].legs[0].start_address,
                    endAddress: routes[0].legs[0].end_address,
                    distance: routes[0].legs[0].distance.value,
                    duration: routes[0].legs[0].duration.value,
                    steps: routes[0].legs[0].steps,
                    route: decodedPoints,
                    state: '0',
                    timestamp: response.metadata.timestamp,
                    destination: pressLocation,
                };
                console.log("Direction OK! URL:", direction);
                resolve(direction);
            } else {
                console.error('Error building directions!');
                resolve(null);
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            resolve(null);
        }
    });
};

const getDirectionDriver = (origin, destination) => {
    if (origin && destination)
        return new Promise(async (resolve, reject) => {
            console.log("API direction RUNNING...................!");
            try {
                let response = await orsDirections.calculate({
                    coordinates: [[origin.longitude, origin.latitude], [destination.longitude, destination.latitude]],
                    profile: 'driving-hgv',
                    restrictions: {
                        height: 10,
                        weight: 5
                    },
                    extra_info: ['waytype', 'steepness'],
                    avoidables: ['highways', 'tollways', 'ferries', 'fords'],
                    format: 'json'
                })
                const start = await getAddressFromLocation(origin.latitude, origin.longitude);
                const end = await getAddressFromLocation(destination.latitude, destination.longitude);
                const routes = response.routes;
                if (routes && routes.length > 0) {
                    const points = routes[0].geometry;
                    const decodedPoints = decodePolyline(points);
                    const direction = {
                        summary: `${start.address.road ? start.address.road : start.address.suburb} ${start.address.city_district}-${end.address.road ? end.address.road : end.address.suburb} ${end.address.city_district}-${response.metadata.timestamp}`,
                        startAddress: start.display_name,
                        endAddress: end.display_name,
                        distance: routes[0].summary.distance,
                        duration: routes[0].summary.duration,
                        steps: routes[0].segments[0].steps,
                        route: decodedPoints,
                        state: 0,
                        timestamp: response.metadata.timestamp,
                        currentDriver: origin,
                    };
                    console.log("Direction OK! URL:", direction.summary);
                    resolve(direction);
                } else {
                    console.error('Error building directions!');
                    resolve(null);
                }
            } catch (err) {
                console.log("An error occurred: " + err.status)
                console.error(await err.response.json())
                reject(err);
            }
        });
    else
        return null;
};



export {
    getRouteDirection,
    getAddressFromLocation,
    getAddress,
    getDirections,
    getLocationFromAddress,
    getDirectionDriver,
}