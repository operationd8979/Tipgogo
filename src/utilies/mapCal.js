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

const toRadians = (angle) => {
    return angle * (Math.PI / 180);
};

