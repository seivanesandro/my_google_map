import React, {
    useEffect,
    useRef,
    useState,
    useCallback
} from 'react';

const GoogleMapsComponent = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const trafficLayerRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const [userPosition, setUserPosition] =
        useState(null);
    const [destination, setDestination] =
        useState('');

    const apiGoogleMapKey =
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    // Load Google Maps script
    const loadGoogleMapsScript =
        useCallback(() => {
            return new Promise(
                (resolve, reject) => {
                    if (
                        window.google &&
                        window.google.maps
                    ) {
                        resolve();
                    } else {
                        const script =
                            document.createElement(
                                'script'
                            );
                        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiGoogleMapKey}&libraries=places`;
                        script.defer = true;
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(
                            script
                        );
                    }
                }
            );
        }, [apiGoogleMapKey]);

    // Initialize the map
    const initMap = useCallback(userLatLng => {
        if (
            window.google &&
            window.google.maps &&
            mapRef.current
        ) {
            const map =
                new window.google.maps.Map(
                    mapRef.current,
                    {
                        center: userLatLng,
                        zoom: 15
                    }
                );

            mapInstanceRef.current = map;

            // Add traffic layer
            trafficLayerRef.current =
                new window.google.maps.TrafficLayer();
            trafficLayerRef.current.setMap(map);

            // Initialize directions services
            directionsServiceRef.current =
                new window.google.maps.DirectionsService();
            directionsRendererRef.current =
                new window.google.maps.DirectionsRenderer(
                    {
                        map: map,
                        suppressMarkers: false
                    }
                );

            // Add a marker for the user's location
            userMarkerRef.current =
                new window.google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    title: 'Your Location'
                });
        }
    }, []);

    // Update user's position on the map
    const updateUserPosition = useCallback(
        userLatLng => {
            if (userMarkerRef.current) {
                userMarkerRef.current.setPosition(
                    userLatLng
                );
            } else {
                userMarkerRef.current =
                    new window.google.maps.Marker(
                        {
                            position: userLatLng,
                            map: mapInstanceRef.current,
                            title: 'Your Location'
                        }
                    );
            }

            if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(
                    userLatLng
                );
            }
        },
        []
    );

    // Watch user's position in real-time
    const watchUserPosition = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                position => {
                    const userLatLng = {
                        lat: position.coords
                            .latitude,
                        lng: position.coords
                            .longitude
                    };
                    setUserPosition(userLatLng);
                    updateUserPosition(
                        userLatLng
                    );
                },
                error => {
                    console.error(
                        'Error getting user location:',
                        error
                    );
                    alert(
                        'Unable to retrieve your location. Please enable location services.'
                    );
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0
                }
            );
        } else {
            alert(
                'Geolocation is not supported by your browser.'
            );
        }
    }, [updateUserPosition]);

    // Calculate route
    const calculateRoute = useCallback(() => {
        if (!destination || !userPosition) {
            alert(
                'Please enter a destination and allow location access.'
            );
            return;
        }

        directionsServiceRef.current.route(
            {
                origin: userPosition,
                destination: destination,
                travelMode:
                    window.google.maps.TravelMode
                        .DRIVING
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    directionsRendererRef.current.setDirections(
                        result
                    );
                } else {
                    console.error(
                        'Error calculating route:',
                        status
                    );
                    alert(
                        'Unable to calculate route. Please check the destination.'
                    );
                }
            }
        );
    }, [destination, userPosition]);

    useEffect(() => {
        const loadMap = async () => {
            try {
                await loadGoogleMapsScript();

                // Get user's initial position
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const userLatLng = {
                            lat: position.coords
                                .latitude,
                            lng: position.coords
                                .longitude
                        };
                        setUserPosition(
                            userLatLng
                        );
                        initMap(userLatLng);
                    },
                    error => {
                        console.error(
                            'Error getting user location:',
                            error
                        );
                        alert(
                            'Unable to retrieve your location. Please enable location services.'
                        );
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 0
                    }
                );

                // Watch user's position in real-time
                watchUserPosition();
            } catch (error) {
                console.error(
                    'Error loading Google Maps script:',
                    error
                );
            }
        };

        loadMap();

        return () => {
            if (trafficLayerRef.current) {
                trafficLayerRef.current.setMap(
                    null
                );
            }
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(
                    null
                );
            }
        };
    }, [
        loadGoogleMapsScript,
        initMap,
        watchUserPosition
    ]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Google Maps Application</h1>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter destination"
                    value={destination}
                    onChange={e =>
                        setDestination(
                            e.target.value
                        )
                    }
                    style={{
                        width: '300px',
                        padding: '10px',
                        marginRight: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
                <button
                    onClick={calculateRoute}
                    style={{
                        padding: '10px 20px',
                        backgroundColor:
                            '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Calculate Route
                </button>
            </div>
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '500px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            ></div>
            {userPosition && (
                <div
                    style={{ marginTop: '20px' }}
                >
                    <h3>
                        Your Current Location:
                    </h3>
                    <p>
                        Latitude:{' '}
                        {userPosition.lat}
                    </p>
                    <p>
                        Longitude:{' '}
                        {userPosition.lng}
                    </p>
                </div>
            )}
        </div>
    );
};

export default GoogleMapsComponent;
