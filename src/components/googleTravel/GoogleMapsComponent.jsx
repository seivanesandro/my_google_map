import React, {
    useEffect,
    useRef,
    useState,
    useCallback
} from 'react';

const GoogleMapsComponent = () => {
    const mapRef = useRef(null); // Referência para o elemento DOM onde o mapa será renderizado
    const mapInstanceRef = useRef(null); // Instância do mapa
    const userMarkerRef = useRef(null); // Marcador da posição do usuário
    const originMarkerRef = useRef(null); // Marcador para o ponto de origem
    const destinationMarkerRef = useRef(null); // Marcador para o ponto de destino
    const directionsServiceRef = useRef(null); // Serviço de rotas do Google Maps
    const directionsRendererRef = useRef(null); // Renderizador de rotas do Google Maps

    const [userPosition, setUserPosition] =
        useState(null); // Posição atual do usuário
    const [destination, setDestination] =
        useState(''); // Destino inserido pelo usuário
    const [directions, setDirections] = useState(
        []
    ); // Lista de direções (passos da rota)
    const [travelTime, setTravelTime] =
        useState(''); // Tempo estimado de viagem
    const [
        currentStepIndex,
        setCurrentStepIndex
    ] = useState(0); // Índice do passo atual da rota
    const [
        currentInstruction,
        setCurrentInstruction
    ] = useState(''); // Instrução atual exibida no pop-up
    const [
        isNavigationActive,
        setIsNavigationActive
    ] = useState(false); // Estado para controlar a navegação

    const apiGoogleMapKey =
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Chave da API do Google Maps

    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript =
        useCallback(() => {
            if (
                window.google &&
                window.google.maps
            ) {
                return Promise.resolve();
            }

            return new Promise(
                (resolve, reject) => {
                    const existingScript =
                        document.querySelector(
                            `script[src*="maps.googleapis.com"]`
                        );
                    if (existingScript) {
                        resolve();
                        return;
                    }

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
            );
        }, [apiGoogleMapKey]);

    // Função para inicializar o mapa
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
                        zoom: 18
                    }
                );

            mapInstanceRef.current = map;

            const trafficLayer =
                new window.google.maps.TrafficLayer();
            trafficLayer.setMap(map);

            directionsServiceRef.current =
                new window.google.maps.DirectionsService();
            directionsRendererRef.current =
                new window.google.maps.DirectionsRenderer(
                    {
                        map: map,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor:
                                '#000000',
                            strokeWeight: 6
                        }
                    }
                );

            userMarkerRef.current =
                new window.google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    title: 'Your Location',
                    icon: {
                        url: 'https://img.icons8.com/color/48/000000/car.png', // Ícone de carro
                        scaledSize:
                            new window.google.maps.Size(
                                40,
                                40
                            )
                    }
                });
        }
    }, []);

    // Função para atualizar a posição do usuário no mapa
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
                            title: 'Your Location',
                            icon: {
                                url: 'https://img.icons8.com/color/48/000000/car.png', // Ícone de carro
                                scaledSize:
                                    new window.google.maps.Size(
                                        40,
                                        40
                                    )
                            }
                        }
                    );
            }

            if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(
                    userLatLng
                );
                mapInstanceRef.current.setZoom(
                    18
                );
            }
        },
        []
    );

    // Função para calcular a rota
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

                    const steps =
                        result.routes[0].legs[0]
                            .steps;
                    const duration =
                        result.routes[0].legs[0]
                            .duration.text;

                    setDirections(steps);
                    setTravelTime(duration);

                    // Adiciona o marcador para o ponto de origem
                    if (originMarkerRef.current) {
                        originMarkerRef.current.setMap(
                            null
                        );
                    }
                    originMarkerRef.current =
                        new window.google.maps.Marker(
                            {
                                position:
                                    result
                                        .routes[0]
                                        .legs[0]
                                        .start_location,
                                map: mapInstanceRef.current,
                                title: 'Start Point',
                                icon: {
                                    path: window
                                        .google
                                        .maps
                                        .SymbolPath
                                        .CIRCLE, // Marcador quadrado pequeno
                                    fillColor:
                                        '#007bff',
                                    fillOpacity: 1,
                                    scale: 8,
                                    strokeColor:
                                        '#ffffff',
                                    strokeWeight: 2
                                }
                            }
                        );

                    // Adiciona o marcador para o ponto de destino
                    if (
                        destinationMarkerRef.current
                    ) {
                        destinationMarkerRef.current.setMap(
                            null
                        );
                    }
                    destinationMarkerRef.current =
                        new window.google.maps.Marker(
                            {
                                position:
                                    result
                                        .routes[0]
                                        .legs[0]
                                        .end_location,
                                map: mapInstanceRef.current,
                                title: 'Destination',
                                icon: {
                                    path: window
                                        .google
                                        .maps
                                        .SymbolPath
                                        .CIRCLE, // Marcador quadrado pequeno
                                    fillColor:
                                        '#dc3545',
                                    fillOpacity: 1,
                                    scale: 8,
                                    strokeColor:
                                        '#ffffff',
                                    strokeWeight: 2
                                }
                            }
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

    // Função para iniciar a navegação
    const startNavigation = () => {
        if (directions.length === 0) {
            alert(
                'Please calculate a route first.'
            );
            return;
        }

        setIsNavigationActive(true);
        setCurrentStepIndex(0);
        setCurrentInstruction(
            directions[0]?.instructions.replace(
                /<[^>]*>/g,
                ''
            )
        );

        const watchId =
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

                    if (
                        currentStepIndex <
                        directions.length
                    ) {
                        const nextStep =
                            directions[
                                currentStepIndex
                            ];
                        const stepLatLng =
                            new window.google.maps.LatLng(
                                nextStep.end_location.lat,
                                nextStep.end_location.lng
                            );

                        const distance =
                            window.google.maps.geometry.spherical.computeDistanceBetween(
                                new window.google.maps.LatLng(
                                    userLatLng.lat,
                                    userLatLng.lng
                                ),
                                stepLatLng
                            );

                        if (distance < 50) {
                            setCurrentInstruction(
                                nextStep.instructions.replace(
                                    /<[^>]*>/g,
                                    ''
                                )
                            );
                            setCurrentStepIndex(
                                prevIndex =>
                                    prevIndex + 1
                            );
                        }
                    }
                },
                error => {
                    console.error(
                        'Error watching user location:',
                        error
                    );
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0
                }
            );

        return () => {
            navigator.geolocation.clearWatch(
                watchId
            );
        };
    };

    // Função para cancelar a navegação
    const cancelNavigation = () => {
        setIsNavigationActive(false);
        setCurrentInstruction('');
        setDirections([]);
        setTravelTime('');
        setDestination('');
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(
                { routes: [] }
            );
        }
        if (originMarkerRef.current) {
            originMarkerRef.current.setMap(null);
        }
        if (destinationMarkerRef.current) {
            destinationMarkerRef.current.setMap(
                null
            );
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    // Efeito para falar a instrução atual
    useEffect(() => {
        if (currentInstruction) {
            const synth = window.speechSynthesis;
            const utterance =
                new SpeechSynthesisUtterance(
                    currentInstruction
                );
            synth.speak(utterance);
        }
    }, [currentInstruction]);

    // Efeito para carregar o mapa e a posição do usuário
    useEffect(() => {
        const loadMap = async () => {
            try {
                await loadGoogleMapsScript();

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
            } catch (error) {
                console.error(
                    'Error loading Google Maps script:',
                    error
                );
            }
        };

        loadMap();

        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(
                    null
                );
            }
        };
    }, [loadGoogleMapsScript, initMap]);

    return (
        <div style={{ padding: '20px' }}>
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
                {directions.length > 0 &&
                    !isNavigationActive && (
                        <button
                            onClick={
                                startNavigation
                            }
                            style={{
                                padding:
                                    '10px 20px',
                                backgroundColor:
                                    '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius:
                                    '4px',
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}
                        >
                            Start Navigation
                        </button>
                    )}
                {isNavigationActive && (
                    <button
                        onClick={cancelNavigation}
                        style={{
                            padding: '10px 20px',
                            backgroundColor:
                                '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '10px'
                        }}
                    >
                        Cancel Navigation
                    </button>
                )}
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
            {directions.length > 0 && (
                <div
                    style={{ marginTop: '20px' }}
                >
                    <h3>
                        Estimated Travel Time:{' '}
                        {travelTime}
                    </h3>
                </div>
            )}
            {currentInstruction && (
                <div
                    style={{
                        marginTop: '20px',
                        padding: '10px',
                        color: '#333',
                        backgroundColor:
                            '#f8f9fa',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                >
                    <h4>Current Instruction:</h4>
                    <p>{currentInstruction}</p>
                </div>
            )}
        </div>
    );
};

export default GoogleMapsComponent;
