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

    // Função para recalcular a rota automaticamente
    const recalculateRoute = userLatLng => {
        directionsServiceRef.current.route(
            {
                origin: userLatLng, // Origem: posição atual do usuário
                destination: destination, // Destino: definido pelo usuário
                travelMode:
                    window.google.maps.TravelMode
                        .DRIVING // Modo de viagem
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    directionsRendererRef.current.setDirections(
                        result
                    ); // Atualiza a rota no mapa

                    const steps =
                        result.routes[0].legs[0]
                            .steps; // Passos da nova rota
                    const duration =
                        result.routes[0].legs[0]
                            .duration.text; // Tempo estimado

                    setDirections(steps); // Atualiza os passos no estado
                    setTravelTime(duration); // Atualiza o tempo estimado no estado

                    // Reinicia a navegação com a nova rota
                    setCurrentStepIndex(0); // Reinicia o índice do passo atual
                    setCurrentInstruction(
                        steps[0]?.instructions.replace(
                            /<[^>]*>/g,
                            ''
                        ) // Remove tags HTML da instrução
                    );

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
                    synth.speak(utterance); // Fala a instrução inicial
                } else {
                    console.error(
                        'Error recalculating route:',
                        status
                    ); // Log de erro
                    alert(
                        'Unable to recalculate route. Please check your connection or destination.'
                    );
                }
            }
        );
    };

    // Função para iniciar a navegação com atualização em tempo real
    const startNavigation = () => {
        if (directions.length === 0) {
            alert(
                'Por favor, calcule uma rota primeiro.'
            ); // Verifica se a rota foi calculada
            return;
        }

        // Garante que a síntese de voz esteja disponível
        if (!window.speechSynthesis) {
            alert(
                'Desculpe, a síntese de voz não é suportada neste navegador.'
            );
            return;
        }
        const synth = window.speechSynthesis;

        setIsNavigationActive(true); // Ativa o estado de navegação
        setCurrentStepIndex(0); // Reinicia o índice do passo atual

        // Define e fala a primeira instrução
        const firstInstructionText =
            directions[0]?.instructions.replace(
                /<[^>]*>/g,
                ''
            ) || 'Iniciar navegação.';
        setCurrentInstruction(
            firstInstructionText
        );
        // Cancela qualquer fala anterior e fala a primeira instrução
        synth.cancel();
        const firstUtterance =
            new SpeechSynthesisUtterance(
                firstInstructionText
            );
        synth.speak(firstUtterance);

        // Para qualquer watchPosition anterior antes de iniciar um novo
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(
                watchIdRef.current
            );
        }

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

                    // Atualiza a posição do usuário no estado e no marcador do mapa
                    setUserPosition(userLatLng);
                    updateUserPosition(
                        userLatLng
                    );

                    // Só executa a lógica de navegação se a navegação estiver ativa e houver direções
                    if (
                        !isNavigationActive ||
                        directions.length === 0
                    ) {
                        return;
                    }

                    // --- Lógica de Verificação Off-Route (Executada em cada atualização) ---
                    // Cria a polyline da rota completa para verificar se o usuário está nela
                    const routePath =
                        directions.flatMap(
                            step =>
                                window.google.maps.geometry.encoding.decodePath(
                                    step.polyline
                                        .points
                                ) // Assumindo que 'directions' contém a polyline de cada passo
                        );
                    // Se não tiver a polyline por passo, use as end_locations como antes, mas é menos preciso
                    // const routePathFallback = directions.map(step => new window.google.maps.LatLng(step.end_location.lat, step.end_location.lng));
                    const routePolyline =
                        new window.google.maps.Polyline(
                            {
                                path: routePath /* ou routePathFallback */
                            }
                        );

                    const isOnRoute =
                        window.google.maps.geometry.poly.isLocationOnEdge(
                            new window.google.maps.LatLng(
                                userLatLng.lat,
                                userLatLng.lng
                            ),
                            routePolyline,
                            0.0007 // Tolerância ligeiramente aumentada (~77 metros) - AJUSTAR CONFORME NECESSÁRIO
                        );

                    if (!isOnRoute) {
                        console.log(
                            'Usuário saiu do trajeto. Recalculando a rota...'
                        );
                        // Cancela a fala atual antes de recalcular
                        synth.cancel();
                        recalculateRoute(
                            userLatLng
                        ); // Recalcula a rota
                        // Retorna para permitir que o recalculateRoute atualize o estado antes da próxima execução
                        return;
                    }

                    // --- Lógica de Avanço de Passo (Só se estiver na rota) ---
                    if (
                        currentStepIndex <
                        directions.length
                    ) {
                        const currentStep =
                            directions[
                                currentStepIndex
                            ]; // Passo atual
                        const nextStepLatLng =
                            new window.google.maps.LatLng(
                                currentStep.end_location.lat,
                                currentStep.end_location.lng
                            );

                        // Calcula a distância até o *fim* do passo atual
                        const distanceToEndOfCurrentStep =
                            window.google.maps.geometry.spherical.computeDistanceBetween(
                                new window.google.maps.LatLng(
                                    userLatLng.lat,
                                    userLatLng.lng
                                ),
                                nextStepLatLng
                            );

                        // Condição para avançar: se estiver suficientemente perto do fim do passo atual
                        // Aumentamos ligeiramente a distância para dar mais margem em mobile
                        const proximityThreshold = 70; // Metros - AJUSTAR CONFORME NECESSÁRIO

                        if (
                            distanceToEndOfCurrentStep <
                            proximityThreshold
                        ) {
                            const nextIndex =
                                currentStepIndex +
                                1;

                            // Verifica se ainda há um próximo passo
                            if (
                                nextIndex <
                                directions.length
                            ) {
                                const nextInstructionText =
                                    directions[
                                        nextIndex
                                    ].instructions.replace(
                                        /<[^>]*>/g,
                                        ''
                                    ) ||
                                    `Seguir para o próximo passo.`;

                                // Atualiza o estado para a próxima instrução e próximo índice
                                setCurrentInstruction(
                                    nextInstructionText
                                );
                                setCurrentStepIndex(
                                    nextIndex
                                ); // Atualiza o índice

                                // Cancela fala anterior e fala a nova instrução
                                synth.cancel();
                                const nextUtterance =
                                    new SpeechSynthesisUtterance(
                                        nextInstructionText
                                    );
                                synth.speak(
                                    nextUtterance
                                );
                            } else {
                                // Chegou ao fim do último passo
                                const finalMessage =
                                    'Parabéns! Chegou ao seu destino sem problemas!';
                                setCurrentInstruction(
                                    finalMessage
                                );
                                // Cancela fala anterior e fala a mensagem final
                                synth.cancel();
                                const finalUtterance =
                                    new SpeechSynthesisUtterance(
                                        finalMessage
                                    );
                                synth.speak(
                                    finalUtterance
                                );
                                cancelNavigation(); // Finaliza a navegação
                            }
                        }
                        // Se não estiver perto o suficiente do fim do passo atual, não faz nada, espera a próxima atualização de posição
                    }
                    // Se currentStepIndex >= directions.length, significa que já deveria ter chegado (ou está no último passo e a lógica acima tratará)
                },
                error => {
                    console.error(
                        'Erro ao observar a localização:',
                        error
                    );
                    // Informa o usuário sobre o erro de localização
                    // Poderia tentar usar getCurrentPosition como fallback aqui, mas watchPosition é geralmente preferível para navegação.
                    alert(
                        'Erro ao obter a localização. Verifique as permissões e o sinal de GPS.'
                    );
                    // Considerar cancelar a navegação se o erro persistir?
                    // cancelNavigation();
                },
                {
                    enableHighAccuracy: true, // Essencial para navegação
                    maximumAge: 0, // Não usar cache de posição
                    timeout: 10000 // Tempo limite para obter a posição (10 segundos)
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
