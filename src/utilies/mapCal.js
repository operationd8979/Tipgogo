export const distanceTwoGeo = (geo1, geo2) => {

    const earthRadius = 6371000; // Bán kính trái đất (đơn vị: mét)
    const lat1 = geo1.latitude;
    const lon1 = geo1.longitude;
    const lat2 = geo2.latitude;
    const lon2 = geo2.longitude;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance;
};

export const calculateDistance = (coordinates) => {
    let distance = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
        const lat1 = coordinates[i].lat;
        const lng1 = coordinates[i].lng;
        const lat2 = coordinates[i + 1].lat;
        const lng2 = coordinates[i + 1].lng;

        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const segmentDistance = 6371 * c; // Earth's radius is approximately 6371 km

        distance += segmentDistance;
    }

    return distance;
};


export const findShortestPaths = (origin,requests,destination) => {

    let minDistance = Number.MAX_VALUE;
    //let maxDistance = Number.MIN_VALUE;
    let shortestPath1 = [];
    //let biggestPath2 = [];

    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < requests.length; j++) {
            if (i === j) continue;
            const path1 = calculateDistance([origin, requests[i].geo1, requests[i].geo2, requests[j].geo1, requests[j].geo2, destination]);
            //const path2 = calculateDistance([origin, ...routes[i].coordinates, ...routes[j].coordinates, destination]);
            if (path1 < minDistance) {
                minDistance = path1;
                shortestPath1 = [requests[i], requests[j]];
            }
            // if (path2 > maxDistance) {
            //     maxDistance = path2;
            //     shortestPath2 = [routes[i], routes[j]];
            // }
        }
    }

    return shortestPath1;
};

export const toRadians = (angle) => {
    return angle * (Math.PI / 180);
};

