import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../assets/StarCoordinates.css';
import image from  '../assets/illu-pegase-1.jpg'

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
    // Ajoutez plus d'étoiles ici si nécessaire
};

const StarCoordinates: React.FC = () => {
    const { starName } = useParams<{ starName: string }>();
    const [coordinates, setCoordinates] = useState<StarCoordinates | null>(null);
    const [position, setPosition] = useState<Position | null>(null);
    const [orientation, setOrientation] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                    setError(null);
                },
                (err) => {
                    console.log(err);
                    setError('Geolocation permission denied. Please allow location access.');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
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
        setCoordinates(starData['Markab']);
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
        <div className="star-coordinates-container">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {position && horizontalCoordinates && (
                <>
                    <div className={"pegase"}>
                        <img src={image} alt={'pegase'}></img>
                    </div>
                    {orientation !== null && (
                        <>
                            <div className="arrow-container">
                                <div
                                    className="arrow"
                                    style={{
                                        transform: `rotate(${orientation - horizontalCoordinates.azimuth}deg)`,
                                    }}
                                >
                                    <svg fill="#000000" width="800px" height="800px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                        <title>arrow-line</title>
                                        <path d="M27.66,15.61,18,6,8.34,15.61A1,1,0,1,0,9.75,17L17,9.81V28.94a1,1,0,1,0,2,0V9.81L26.25,17a1,1,0,0,0,1.41-1.42Z"></path>
                                        <rect x="0" y="0" width="36" height="36" fillOpacity="0"/>
                                    </svg>
                                </div>
                                <p>Alignez la flèche avec la direction de la constallation.</p>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default StarCoordinates;
