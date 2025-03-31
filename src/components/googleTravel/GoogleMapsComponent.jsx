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
    const watchIdRef = useRef(null); // Para armazenar o ID do watchPosition

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
        // Verifica se a rota foi calculada antes de iniciar a navegação
        if (directions.length === 0) {
            alert(
                'Please calculate a route first.'
            );
            return;
        }

        // Ativa o estado de navegação
        setIsNavigationActive(true);

        // Define o índice do passo atual como o primeiro passo
        setCurrentStepIndex(0);

        // Define a primeira instrução da rota
        setCurrentInstruction(
            directions[0]?.instructions.replace(
                /<[^>]*>/g,
                ''
            ) // Remove tags HTML das instruções
        );

        // Inicia o monitoramento da posição do usuário em tempo real
        watchIdRef.current =
            navigator.geolocation.watchPosition(
                position => {
                    const userLatLng = {
                        lat: position.coords
                            .latitude,
                        lng: position.coords
                            .longitude
                    };

                    // Atualiza a posição do usuário no estado e no mapa
                    setUserPosition(userLatLng);
                    updateUserPosition(
                        userLatLng
                    );

                    // Verifica se o usuário ainda está seguindo a rota
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

                        // Calcula a distância entre a posição atual do usuário e o próximo ponto da rota
                        const distance =
                            window.google.maps.geometry.spherical.computeDistanceBetween(
                                new window.google.maps.LatLng(
                                    userLatLng.lat,
                                    userLatLng.lng
                                ),
                                stepLatLng
                            );

                        // Se o usuário estiver próximo do próximo ponto, atualiza a instrução e o índice
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

                            // Recalcula o trajeto e o tempo de viagem em tempo real
                            directionsServiceRef.current.route(
                                {
                                    origin: userLatLng, // Posição atual do usuário
                                    destination:
                                        destination, // Destino final
                                    travelMode:
                                        window
                                            .google
                                            .maps
                                            .TravelMode
                                            .DRIVING
                                },
                                (
                                    result,
                                    status
                                ) => {
                                    if (
                                        status ===
                                            'OK' &&
                                        result
                                    ) {
                                        // Atualiza o trajeto no mapa
                                        directionsRendererRef.current.setDirections(
                                            result
                                        );

                                        // Atualiza os passos e o tempo estimado de viagem
                                        const updatedSteps =
                                            result
                                                .routes[0]
                                                .legs[0]
                                                .steps;
                                        const updatedDuration =
                                            result
                                                .routes[0]
                                                .legs[0]
                                                .duration
                                                .text;

                                        setDirections(
                                            updatedSteps
                                        );
                                        setTravelTime(
                                            updatedDuration
                                        );
                                    } else {
                                        console.error(
                                            'Error recalculating route:',
                                            status
                                        );
                                    }
                                }
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
                    enableHighAccuracy: true, // Garante maior precisão na localização
                    maximumAge: 0 // Não utiliza cache para a localização
                }
            );
    };

    // Função para cancelar a navegação
    const cancelNavigation = () => {
        // Desativa o estado de navegação
        setIsNavigationActive(false);

        // Limpa as instruções, rota e tempo de viagem
        setCurrentInstruction('');
        setDirections([]);
        setTravelTime('');
        setDestination('');

        // Remove a rota do mapa
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(
                { routes: [] }
            );
        }

        // Remove os marcadores de origem e destino
        if (originMarkerRef.current) {
            originMarkerRef.current.setMap(null);
        }
        if (destinationMarkerRef.current) {
            destinationMarkerRef.current.setMap(
                null
            );
        }

        // Para de monitorar a posição do usuário
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(
                watchIdRef.current
            );
        }

        // Cancela qualquer narração em andamento
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    // Efeito para narrar a instrução atual
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

    // Efeito para carregar o mapa ao montar o componente
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
