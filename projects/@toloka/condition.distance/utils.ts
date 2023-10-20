const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceBetweenEarthCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const earthRadiusKm = 6371;
    const mInKm = 1000;

    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2));
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c * mInKm;
};
