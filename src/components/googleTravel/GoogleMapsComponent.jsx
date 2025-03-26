import React, {
    useEffect,
    useRef,
    useState,
    useCallback
} from 'react';

// Componente principal do Google Maps
const GoogleMapsComponent = () => {
    // Referências para o mapa e serviços do Google Maps
    const mapRef = useRef(null); // Referência para o elemento DOM onde o mapa será renderizado
    const mapInstanceRef = useRef(null); // Instância do mapa
    const userMarkerRef = useRef(null); // Marcador da posição do usuário
    const directionsServiceRef = useRef(null); // Serviço de rotas do Google Maps
    const directionsRendererRef = useRef(null); // Renderizador de rotas do Google Maps

    // Estados para armazenar informações do usuário e da navegação
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
        isNavigationActive,
        setIsNavigationActive
    ] = useState(false); // Indica se a navegação está ativa
    const [
        currentStepIndex,
        setCurrentStepIndex
    ] = useState(0); // Índice do passo atual da rota
    const [
        currentInstruction,
        setCurrentInstruction
    ] = useState(''); // Instrução atual exibida no pop-up

    const apiGoogleMapKey =
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Chave da API do Google Maps

    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript = useCallback(() => {
            if (
                window.google &&
                window.google.maps
            ) {
                return Promise.resolve(); // Se o script já estiver carregado, resolve imediatamente
            }

            return new Promise(
                (resolve, reject) => {
                    const existingScript =
                        document.querySelector(
                            `script[src*="maps.googleapis.com"]`
                        );
                    if (existingScript) {
                        resolve(); // Se o script já existir no DOM, resolve imediatamente
                        return;
                    }

                    // Cria e adiciona o script do Google Maps ao DOM
                    const script =
                        document.createElement(
                            'script'
                        );
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiGoogleMapKey}&libraries=places`;
                    script.defer = true; // Carrega o script de forma assíncrona
                    script.onload = resolve; // Resolve a promessa quando o script for carregado
                    script.onerror = reject; // Rejeita a promessa se houver erro ao carregar o script
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
            // Cria uma nova instância do mapa
            const map =
                new window.google.maps.Map(
                    mapRef.current,
                    {
                        center: userLatLng, // Centraliza o mapa na posição do usuário
                        zoom: 18 // Define o nível de zoom inicial para mostrar as ruas
                    }
                );

            mapInstanceRef.current = map; // Salva a instância do mapa

            // Adiciona a camada de tráfego ao mapa
            const trafficLayer =
                new window.google.maps.TrafficLayer();
            trafficLayer.setMap(map);

            // Inicializa os serviços de rotas e renderização
            directionsServiceRef.current =
                new window.google.maps.DirectionsService();
            directionsRendererRef.current =
                new window.google.maps.DirectionsRenderer(
                    {
                        map: map, // Associa o renderizador ao mapa
                        suppressMarkers: false // Exibe os marcadores padrão
                    }
                );

            // Adiciona um marcador para a posição do usuário
            userMarkerRef.current =
                new window.google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    title: 'Your Location'
                });
        }
    }, []);

    // Função para atualizar a posição do usuário no mapa
    const updateUserPosition = useCallback(
        userLatLng => {
            if (userMarkerRef.current) {
                userMarkerRef.current.setPosition(
                    userLatLng
                ); // Atualiza a posição do marcador
            } else {
                // Cria um novo marcador se ele ainda não existir
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
                ); // Centraliza o mapa na nova posição do usuário
                mapInstanceRef.current.setZoom(
                    18
                ); // Ajusta o zoom para mostrar as ruas
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

        // Solicita a rota ao serviço de rotas do Google Maps
        directionsServiceRef.current.route(
            {
                origin: userPosition, // Posição inicial
                destination: destination, // Destino
                travelMode:
                    window.google.maps.TravelMode
                        .DRIVING // Modo de viagem
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    directionsRendererRef.current.setDirections(
                        result
                    ); // Renderiza a rota no mapa

                    // Ajusta o zoom para exibir toda a rota
                    const bounds =
                        new window.google.maps.LatLngBounds();
                    result.routes[0].overview_path.forEach(
                        point => {
                            bounds.extend(point);
                        }
                    );
                    mapInstanceRef.current.fitBounds(
                        bounds
                    );

                    // Extrai os passos da rota e o tempo estimado de viagem
                    const steps =
                        result.routes[0].legs[0]
                            .steps;
                    const duration =
                        result.routes[0].legs[0]
                            .duration.text;

                    setDirections(steps); // Salva os passos da rota no estado
                    setTravelTime(duration); // Salva o tempo estimado de viagem no estado
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

        setIsNavigationActive(true); // Ativa o estado de navegação
        setCurrentStepIndex(0); // Reinicia o índice do passo atual
        setCurrentInstruction(
            directions[0]?.instructions.replace(
                /<[^>]*>/g,
                ''
            )
        ); // Exibe a primeira instrução

        const watchId = navigator.geolocation.watchPosition(
                position => {
                    const userLatLng = {
                        lat: position.coords
                            .latitude,
                        lng: position.coords
                            .longitude
                    };
                    setUserPosition(userLatLng); // Atualiza a posição do usuário
                    updateUserPosition(
                        userLatLng
                    ); // Atualiza o marcador no mapa

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
                            ); // Atualiza a instrução atual
                            setCurrentStepIndex(
                                prevIndex =>
                                    prevIndex + 1
                            ); // Avança para o próximo passo
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
            ); // Para de monitorar a posição do usuário
            setIsNavigationActive(false); // Desativa o estado de navegação
        };
    };

    // Função para cancelar a navegação
    const cancelNavigation = () => {
        setIsNavigationActive(false); // Desativa o estado de navegação
        setCurrentInstruction(''); // Remove a instrução atual
        setDirections([]); // Remove as direções
        setTravelTime(''); // Limpa o tempo estimado de viagem
        setDestination(''); // Limpa o destino
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(
                { routes: [] }
            ); // Remove a rota do mapa
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel(); // Cancela qualquer narração em andamento
        }
    };

    // Sincroniza as instruções de voz com os pop-ups
    useEffect(() => {
        if (currentInstruction) {
            const synth = window.speechSynthesis;
            const utterance =
                new SpeechSynthesisUtterance(
                    currentInstruction
                ); // Cria uma narração para a instrução atual
            synth.speak(utterance); // Narra a instrução
        }
    }, [currentInstruction]); // Executa sempre que `currentInstruction` for atualizado

    // Carrega o mapa ao montar o componente
    useEffect(() => {
        const loadMap = async () => {
            try {
                await loadGoogleMapsScript(); // Carrega o script do Google Maps

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
                        ); // Salva a posição inicial do usuário
                        initMap(userLatLng); // Inicializa o mapa
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
                ); // Remove o renderizador de rotas ao desmontar o componente
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
                    } // Atualiza o destino inserido pelo usuário
                    style={{
                        width: '300px',
                        padding: '10px',
                        marginRight: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
                <button
                    onClick={calculateRoute} // Calcula a rota ao clicar no botão
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
                            } // Inicia a navegação ao clicar no botão
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
                        onClick={cancelNavigation} // Cancela a navegação ao clicar no botão
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
                ref={mapRef} // Referência para o elemento DOM onde o mapa será renderizado
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
                    </h3>{' '}
                    {/* Exibe o tempo estimado de viagem */}
                </div>
            )}
            {currentInstruction && (
                <div
                    style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor:
                            '#f8f9fa',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                >
                    <h4>Current Instruction:</h4>
                    <p>
                        {currentInstruction}
                    </p>{' '}
                    {/* Exibe a instrução atual no pop-up */}
                </div>
            )}
        </div>
    );
};

export default GoogleMapsComponent; // Exporta o componente para ser usado em outros arquivos
