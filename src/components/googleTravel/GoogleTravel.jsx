import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { devices } from '../../utils/constantes';


const Show = keyframes`
    0%{
        opacity:0;
    }

    100%{
        opacity:1;
    }
`;

const Scale = keyframes`
    0%{
        transform: scale(0);
    }

    100%{
        transform: scale(1);
    }
`;

const ContainerGoogleMaps = styled.div`
    margin: 7rem auto !important;
    animation: ${Show} 1.5s ease-in;

    @media only screen and (${devices.tablet}) {
        max-width: 800px !important;
        padding: 0 0.5rem 0 0.5rem !important;
    }
    @media only screen and (${devices.iphone14}) {
        max-width: 100% !important;
        padding: 0 0.5rem 0 0.5rem !important;
    }
    @media only screen and (${devices.mobileG}) {
    }
    @media only screen and (${devices.mobileM}) {
        padding: 0 !important;
    }
`;

const MapStyle = styled.div`
    height: 400px;
    width: 100%;
    position: relative;
    overflow: hidden;
    border: 1px solid #333;
    box-shadow: 0 0 0.3rem #333 !important;
`;

const DirectionsPanelStyle = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 1rem;
    background-color: aliceblue;
    animation: ${Scale} 1s ease-out;

    @media only screen and (${devices.fourk}) {
        border: 1px solid #333;
        box-shadow: 0 0 0.3rem #333 !important;
    }
    @media only screen and (${devices.portatilL}) {
        border: 1px solid #333;
        box-shadow: 0 0 0.3rem #333 !important;
    }
    @media only screen and (${devices.portatil}) {
        border: 1px solid #333;
        box-shadow: 0 0 0.3rem #333 !important;
    }
    @media only screen and (${devices.portatilS}) {
        border: 1px solid #333;
        box-shadow: 0 0 0.3rem #333 !important;
    }
    @media only screen and (${devices.tablet}) {
        border: 1px solid #333;
        box-shadow: 0 0 0.3rem #333 !important;
    }

    @media only screen and (${devices.iphone14}) {
        border: 1px solid #333;
        box-shadow: 0 0 0.3rem #333 !important;
        padding: 0.5rem !important;
        margin: 0 !important;
    }
`;

const ContainerFormStyle = styled.div`
    display: flex;
    flex-direction: column;
    margin: 1rem;
    gap: 1rem;
    justify-content: center;
    align-items: flex-start;
    @media only screen and (${devices.tablet}) {
        align-items: center !important;
    }
    @media only screen and (${devices.iphone14}) {
    }
    @media only screen and (${devices.mobileG}) {
    }
    @media only screen and (${devices.mobileM}) {
    }
    @media only screen and (${devices.mobileP}) {
    }
`;

const InputWidth = styled.input`
    &.w-100 {
        width: 18.5% !important;
    }
    @media only screen and (${devices.portatil}) {
        &.w-100 {
            width: 25.5% !important;
        }
    }

    @media only screen and (${devices.tablet}) {
        &.w-100 {
            width: 32.5% !important;
        }
    }
    @media only screen and (${devices.iphone14}) {
        &.w-100 {
            width: 61.5% !important;
        }
    }
    @media only screen and (${devices.mobileG}) {
        &.w-100 {
            width: 62.5% !important;
        }
    }

    @media only screen and (${devices.mobileM}) {
        &.w-100 {
            width: 67.5% !important;
        }
    }
    @media only screen and (${devices.mobileP}) {
        &.w-100 {
            width: 81.5% !important;
        }
    }
`;

const InputGroup = styled.div`
    position: relative !important;
    display: flex !important;
    width: 100% !important;
    justify-content: flex-start !important;
    flex-direction: row !important;
    align-items: stretch !important;

    @media only screen and (${devices.tablet}) {
        justify-content: center !important;
    }
    @media only screen and (${devices.iphone14}) {
    }
    @media only screen and (${devices.mobileG}) {
    }
    @media only screen and (${devices.mobileM}) {
    }
    @media only screen and (${devices.mobileP}) {
    }
`;

const ContainerBtns = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2rem;

    @media only screen and (${devices.tablet}) {
        gap: 4rem !important;
    }
    @media only screen and (${devices.iphone14}) {
        gap: 1.5rem !important;
        flex-direction: column !important;
    }
    @media only screen and (${devices.mobileG}) {
        gap: 1.5rem !important;
        flex-direction: column !important;
    }
`;

//let googleMapsScriptLoaded = false;


const GoogleTravel = () => {
    const mapRef = useRef(null);
    const directionsPanelRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const watchIdRef = useRef(null);
    const trafficLayerRef = useRef(null);

    const apiGoogleMapKey =
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    const [userPosition, setUserPosition] =
        useState(null);
    const [destination, setDestination] =
        useState('');
    const [travelMode, setTravelMode] =
        useState('DRIVING');
    const [mapType, setMapType] =
        useState('roadmap');

    const loadGoogleMapsScript = () => {
        return new Promise((resolve, reject) => {
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
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiGoogleMapKey}&libraries=places,marker,traffic&loading=async`;
                script.defer = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            }
        });
    };

    const initMap = useCallback(() => {
        if (
            window.google &&
            window.google.maps &&
            mapRef.current
        ) {
            mapInstanceRef.current =
                new window.google.maps.Map(
                    mapRef.current,
                    {
                        center: userPosition || {
                            lat: -34.397,
                            lng: 150.644
                        },
                        zoom: 18,
                        mapTypeId: mapType
                    }
                );

            directionsRendererRef.current =
                new window.google.maps.DirectionsRenderer(
                    {
                        map: mapInstanceRef.current,
                        panel: directionsPanelRef.current
                    }
                );
            directionsServiceRef.current =
                new window.google.maps.DirectionsService();

            trafficLayerRef.current =
                new window.google.maps.TrafficLayer();
            trafficLayerRef.current.setMap(
                mapInstanceRef.current
            );

            userMarkerRef.current =
                new window.google.maps.Marker({
                    position: userPosition || {
                        lat: -34.397,
                        lng: 150.644
                    },
                    map: mapInstanceRef.current
                });

            const watchOptions = {
                maximumAge: 15000,
                timeout: 120000,
                enableHighAccuracy: false
            };

            watchIdRef.current =
                navigator.geolocation.watchPosition(
                    pos => {
                        const userLatLng = {
                            lat: pos.coords
                                .latitude,
                            lng: pos.coords
                                .longitude
                        };
                        setUserPosition(
                            userLatLng
                        );
                        updateUserMarker(
                            userLatLng
                        );
                    },
                    error => {
                        handleError(error);
                    },
                    watchOptions
                );
        }
    }, [userPosition, mapType]);

    const updateUserMarker = useCallback(pos => {
        if (
            window.google &&
            window.google.maps &&
            mapInstanceRef.current
        ) {
            if (userMarkerRef.current) {
                userMarkerRef.current.setPosition(
                    pos
                );
            } else {
                userMarkerRef.current =
                    new window.google.maps.Marker(
                        {
                            position: pos,
                            map: mapInstanceRef.current
                        }
                    );
            }
            mapInstanceRef.current.setCenter(pos);
        }
    }, []);

    const calculateRoute = useCallback(() => {
        if (
            window.google &&
            window.google.maps &&
            destination &&
            userPosition &&
            directionsServiceRef.current
        ) {
            directionsServiceRef.current.route(
                {
                    origin: userPosition,
                    destination: destination,
                    travelMode:
                        window.google.maps
                            .TravelMode[
                            travelMode
                        ]
                },
                (result, status) => {
                    if (
                        status === 'OK' &&
                        result
                    ) {
                        directionsRendererRef.current.setDirections(
                            result
                        );
                    } else {
                        console.error(
                            'Erro ao calcular rota:',
                            status
                        );
                    }
                }
            );
        }
    }, [destination, travelMode, userPosition]);

    const handleError = useCallback(error => {
        const errorMessages = {
            [error.PERMISSION_DENIED]:
                'Permissão de geolocalização negada.',
            [error.POSITION_UNAVAILABLE]:
                'Informação de localização indisponível.',
            [error.TIMEOUT]:
                'Tempo de geolocalização excedido.',
            [error.UNKNOWN_ERROR]:
                'Erro desconhecido de geolocalização.'
        };
        alert(
            errorMessages[error.code] ||
                'Erro de geolocalização.'
        );
    }, []);

    const speakDirections = useCallback(() => {
        if (
            window.speechSynthesis &&
            directionsRendererRef.current &&
            directionsRendererRef.current.getDirections()
        ) {
            const directions =
                directionsRendererRef.current.getDirections();
            const steps =
                directions.routes[0].legs[0]
                    .steps;
            const instructions = steps
                .map(step => step.instructions)
                .join('. ');
            const utterance =
                new SpeechSynthesisUtterance(
                    instructions
                );
            window.speechSynthesis.speak(
                utterance
            );
        } else {
            console.warn(
                'Instruções de voz não disponíveis.'
            );
        }
    }, []);

    useEffect(() => {
        const loadMap = async () => {
            try {
                await loadGoogleMapsScript();
                initMap();
            } catch (error) {
                console.error(
                    'Erro ao carregar a API do Google Maps:',
                    error
                );
            }
        };

        loadMap();

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(
                    watchIdRef.current
                );
            }
        };
    }, [userPosition, mapType]);

    useEffect(() => {
        if (userPosition) {
            mapInstanceRef.current.setCenter(
                userPosition
            );
        }
    }, [userPosition]);

    useEffect(() => {
        if (userPosition && destination) {
            calculateRoute();
        }
    }, [
        userPosition,
        destination,
        calculateRoute
    ]);

    const handleMapType = () => {
        setMapType(prevMapType =>
            prevMapType === 'roadmap'
                ? 'satellite'
                : 'roadmap'
        );
    };

    const handleReset = () => {
        window.location.reload();
    };
    return (
        <>
            <ContainerGoogleMaps className="container container-google-map">
                <ContainerFormStyle className="container-form">
                    <InputWidth
                        type="text"
                        id="destination"
                        className="form-control w-100 border border-secondary outline-transparent shadow-0"
                        style={{
                            boxShadow: 'none'
                        }}
                        placeholder="Destino"
                        value={travelMode}
                        onChange={e =>
                            setTravelMode(
                                e.target.value
                            )
                        }
                    />

                    <InputGroup className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label
                                className="input-group-text bg-secondary text-light rounded-end-0 border border-secondary"
                                htmlFor="inputGroupSelect01"
                            >
                                Viagem
                            </label>
                        </div>
                        <select
                            className="custom-select rounded-end-1"
                            id="travelMode"
                            value={travelMode}
                            onChange={e =>
                                setTravelMode(
                                    e.target.value
                                )
                            }
                        >
                            <option
                                value="DRIVING"
                                defaultValue={
                                    true
                                }
                            >
                                Carro
                            </option>
                            <option value="WALKING">
                                A pé
                            </option>
                            <option value="TRANSIT">
                                Transporte público
                            </option>
                            <option value="BICYCLING">
                                Bicicleta
                            </option>
                        </select>
                    </InputGroup>

                    <ContainerBtns className="container-btns">
                        <button
                            className="btn btn-success d-grid gap-2 d-md-block"
                            onClick={
                                calculateRoute
                            }
                        >
                            Calcular Rota
                        </button>
                        <button
                            className="btn btn-info d-grid gap-2 d-md-block"
                            onClick={
                                speakDirections
                            }
                        >
                            Ler Instruções
                        </button>
                    </ContainerBtns>
                </ContainerFormStyle>
                <MapStyle
                    id="map"
                    ref={mapRef}
                    className="map-style"
                ></MapStyle>
                <DirectionsPanelStyle
                    id="directionsPanel"
                    ref={directionsPanelRef}
                    className="direction-panel"
                ></DirectionsPanelStyle>
            </ContainerGoogleMaps>
        </>
    );
};

export default GoogleTravel;