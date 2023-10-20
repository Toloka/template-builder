export interface GeoPoint {
    lat: number;
    lon: number;
}
export type RawGeoPoint = GeoPoint | [number, number] | string;

export const normalizeGeo = (raw: RawGeoPoint): GeoPoint => {
    if (typeof raw === 'string') {
        const [lat, lon] = raw.split(/[,;:]/);

        if (!lat || !lon) {
            return {
                lat: 0,
                lon: 0
            };
        }

        return normalizeGeo([parseFloat(lat), parseFloat(lon)]);
    }

    if (Array.isArray(raw)) {
        if (raw.length !== 2) {
            return { lat: 0, lon: 0 };
        }

        return {
            lat: raw[0] || 0,
            lon: raw[1] || 0
        };
    }

    return raw;
};
