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
    const originMarkerRef = useRef(null);
    const destinationMarkerRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const watchIdRef = useRef(null);

    const [userPosition, setUserPosition] =
        useState(null);
    const [destination, setDestination] =
        useState('');
    const [directions, setDirections] = useState(
        []
    );
    const [travelTime, setTravelTime] =
        useState('');
    const [
        currentStepIndex,
        setCurrentStepIndex
    ] = useState(0);
    const [
        currentInstruction,
        setCurrentInstruction
    ] = useState('');
    const [
        isNavigationActive,
        setIsNavigationActive
    ] = useState(false);

    const apiGoogleMapKey =
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript = useCallback(() => {
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
                        url: 'https://img.icons8.com/color/48/000000/car.png',
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
                                url: 'https://img.icons8.com/color/48/000000/car.png',
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
                                        .CIRCLE,
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
                                        .CIRCLE,
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
        ); // Mostra a primeira instrução

        // Fala a primeira instrução
        const synth = window.speechSynthesis;
        const firstUtterance =
            new SpeechSynthesisUtterance(
                directions[0]?.instructions.replace(
                    /<[^>]*>/g,
                    ''
                )
            );
        synth.speak(firstUtterance);

        // Inicia o rastreamento da localização em tempo real
        watchIdRef.current =
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

                        // Calcula a distância entre o usuário e o próximo passo
                        const distance =
                            window.google.maps.geometry.spherical.computeDistanceBetween(
                                new window.google.maps.LatLng(
                                    userLatLng.lat,
                                    userLatLng.lng
                                ),
                                stepLatLng
                            );

                        // Se o usuário estiver próximo do próximo passo, atualiza para a próxima instrução
                        if (distance < 50) {
                            setCurrentInstruction(
                                nextStep.instructions.replace(
                                    /<[^>]*>/g,
                                    ''
                                )
                            ); // Atualiza a instrução de texto
                            setCurrentStepIndex(
                                prevIndex =>
                                    prevIndex + 1
                            ); // Avança para o próximo passo

                            // Fala a instrução de voz
                            const nextUtterance =
                                new SpeechSynthesisUtterance(
                                    nextStep.instructions.replace(
                                        /<[^>]*>/g,
                                        ''
                                    )
                                );
                            synth.speak(
                                nextUtterance
                            );

                            // Se for o último passo, exibe a mensagem final
                            if (
                                currentStepIndex ===
                                directions.length -
                                    1
                            ) {
                                setCurrentInstruction(
                                    'Parabéns! Chegou ao seu destino sem problemas!'
                                );
                                const finalUtterance =
                                    new SpeechSynthesisUtterance(
                                        'Parabéns! Chegou ao seu destino sem problemas!'
                                    );
                                synth.speak(
                                    finalUtterance
                                );
                                cancelNavigation(); // Finaliza a navegação
                            }
                        }
                    } else {
                        // Verifica se o usuário saiu do trajeto e recalcula a rota
                        const routePolyline =
                            new window.google.maps.Polyline(
                                {
                                    path: directions.map(
                                        step =>
                                            step.end_location
                                    )
                                }
                            );

                        const isOnRoute =
                            window.google.maps.geometry.poly.isLocationOnEdge(
                                new window.google.maps.LatLng(
                                    userLatLng.lat,
                                    userLatLng.lng
                                ),
                                routePolyline,
                                0.0001 // Tolerância em graus (~11 metros)
                            );

                        if (!isOnRoute) {
                            console.log(
                                'Usuário saiu do trajeto. Recalculando a rota...'
                            );
                            recalculateRoute(
                                userLatLng
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
    };

    // Função para recalcular a rota
    const recalculateRoute = userLatLng => {
        directionsServiceRef.current.route(
            {
                origin: userLatLng,
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

                    setCurrentStepIndex(0); // Reinicia a navegação
                    setCurrentInstruction(
                        steps[0]?.instructions.replace(
                            /<[^>]*>/g,
                            ''
                        )
                    ); // Mostra a primeira instrução da nova rota

                    // Fala a nova instrução inicial
                    const synth =
                        window.speechSynthesis;
                    const utterance =
                        new SpeechSynthesisUtterance(
                            steps[0]?.instructions.replace(
                                /<[^>]*>/g,
                                ''
                            )
                        );
                    synth.speak(utterance);
                } else {
                    console.error(
                        'Error recalculating route:',
                        status
                    );
                    alert(
                        'Unable to recalculate route. Please check your connection or destination.'
                    );
                }
            }
        );
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

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(
                watchIdRef.current
            );
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

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

    useEffect(() => {
        const loadMap = async () => {
            try {
                await loadGoogleMapsScript();

                // Inicia o rastreamento da localização em tempo real
                watchIdRef.current =
                    navigator.geolocation.watchPosition(
                        position => {
                            const userLatLng = {
                                lat: position
                                    .coords
                                    .latitude,
                                lng: position
                                    .coords
                                    .longitude
                            };
                            setUserPosition(
                                userLatLng
                            ); // Atualiza o estado da posição do usuário
                            updateUserPosition(
                                userLatLng
                            ); // Atualiza o marcador no mapa
                            if (
                                !mapInstanceRef.current
                            ) {
                                initMap(
                                    userLatLng
                                ); // Inicializa o mapa na primeira localização
                            }
                        },
                        error => {
                            console.error(
                                'Error watching user location:',
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
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(
                    watchIdRef.current
                ); // Para o rastreamento ao desmontar o componente
            }
        };
    }, [
        loadGoogleMapsScript,
        initMap,
        updateUserPosition
    ]);

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
