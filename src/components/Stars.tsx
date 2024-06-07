import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface StarCoordinates {
    ra: string;
    dec: string;
}

interface Position {
    latitude: number;
    longitude: number;
}

const starData: { [key: string]: StarCoordinates } = {
    Markab: { ra: '23h 04m 45.65s', dec: '+15° 12′ 19.0″' },
    Scheat: { ra: '23h 03m 46.45s', dec: '+28° 04′ 58.0″' },
    Algenib: { ra: '00h 13m 14.16s', dec: '+15° 11′ 00.9″' },
    Alpheratz: { ra: '00h 08m 23.26s', dec: '+29° 05′ 25.6″' },
    // Ajoutez plus d'étoiles ici si nécessaire
};

const StarCoordinates: React.FC = () => {
    const { starName } = useParams<{ starName: string }>();
    const [coordinates, setCoordinates] = useState<StarCoordinates | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [orientation, setOrientation] = useState<number | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setPosition({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
        });
    }, []);

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            setOrientation(event.alpha ? event.alpha : 0);
        };

        window.addEventListener('deviceorientation', handleOrientation, true);
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    useEffect(() => {
            setCoordinates( starData["Markab"]);

    }, [starName]);

    const calculateHorizontalCoordinates = () => {
        if (!coordinates || !position) return null;

        const ra = hmsToDegrees(coordinates.ra);
        const dec = dmsToDegrees(coordinates.dec);

        const lat = position.latitude;
        const lon = position.longitude;

        const lst = localSiderealTime(new Date(), lon);
        const ha = lst - ra;

        const alt = Math.asin(
            Math.sin(degreesToRadians(dec)) * Math.sin(degreesToRadians(lat)) +
            Math.cos(degreesToRadians(dec)) *
            Math.cos(degreesToRadians(lat)) *
            Math.cos(degreesToRadians(ha))
        );

        const az = Math.acos(
            (Math.sin(degreesToRadians(dec)) -
                Math.sin(alt) * Math.sin(degreesToRadians(lat))) /
            (Math.cos(alt) * Math.cos(degreesToRadians(lat)))
        );

        return {
            azimuth: radiansToDegrees(az),
            altitude: radiansToDegrees(alt),
        };
    };

    const hmsToDegrees = (hms: string): number => {
        const [h, m, s] = hms.split(/[hms]/).map(Number);
        return 15 * (h + m / 60 + s / 3600);
    };

    const dmsToDegrees = (dms: string): number => {
        const [d, m, s] = dms.split(/[°′″]/).map(Number);
        return Math.abs(d) + m / 60 + s / 3600;
    };

    const degreesToRadians = (degrees: number): number => {
        return degrees * (Math.PI / 180);
    };

    const radiansToDegrees = (radians: number): number => {
        return radians * (180 / Math.PI);
    };

    const localSiderealTime = (date: Date, longitude: number): number => {
        const jd = julianDate(date);
        const t = (jd - 2451545.0) / 36525;
        const gst =
            280.46061837 +
            360.98564736629 * (jd - 2451545.0) +
            0.000387933 * t ** 2 -
            t ** 3 / 38710000;
        return (gst + longitude) % 360;
    };

    const julianDate = (date: Date): number => {
        const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
        const y = date.getFullYear() + 4800 - a;
        const m = (date.getMonth() + 1) + 12 * a - 3;
        return (
            date.getDate() +
            Math.floor((153 * m + 2) / 5) +
            365 * y +
            Math.floor(y / 4) -
            Math.floor(y / 100) +
            Math.floor(y / 400) -
            32045 +
            (date.getHours() - 12) / 24 +
            date.getMinutes() / 1440 +
            date.getSeconds() / 86400
        );
    };

    const horizontalCoordinates = calculateHorizontalCoordinates();

    if (!coordinates) {
        return <div>Star not found</div>;
    }

    return (
        <div>
            <h1>Coordinates of {starName}</h1>
            <p>Right Ascension: {coordinates.ra}</p>
            <p>Declination: {coordinates.dec}</p>
            {position && horizontalCoordinates && (
                <>
                    <h2>Observer's Location</h2>
                    <p>Latitude: {position.latitude}</p>
                    <p>Longitude: {position.longitude}</p>
                    <h2>Horizontal Coordinates</h2>
                    <p>Azimuth: {horizontalCoordinates.azimuth.toFixed(2)}°</p>
                    <p>Altitude: {horizontalCoordinates.altitude.toFixed(2)}°</p>
                    {orientation !== null && (
                        <h2>Device Orientation</h2>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ transform: `rotate(${orientation}deg)` }}>
                            <svg
                                width="100"
                                height="100"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 2L14.09 8.26H20.62L15.27 12.26L17.36 18.52L12 14.52L6.64 18.52L8.73 12.26L3.38 8.26H9.91L12 2Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                        <p>Alignez la flèche avec la direction de l'étoile.</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default StarCoordinates;
