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
    margin: 1rem auto !important;
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
    @media only screen and (${devices.mobileP}) {
        gap: 1rem !important;
    }
`;

let googleMapsScriptLoaded = false;

const GoogleTravel = () => {
    const mapRef = useRef(null);
    const directionsPanelRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const trafficLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const watchIdRef = useRef(null);

    const apiGoogleMapKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const apiGoogleMapURL = process.env.REACT_APP_GOOGLE_MAPS_API_URL;

    const [userPosition, setUserPosition] = useState(null);
    const [destination, setDestination] = useState('');
    const [travelMode, setTravelMode] = useState('DRIVING');
    const [mapInitialized, setMapInitialized] = useState(false);
    const [directionsResult, setDirectionsResult] = useState(null);

    const initMap = useCallback(() => {
        if (!mapRef.current) return;

        mapInstanceRef.current =
            new window.google.maps.Map(
                mapRef.current,
                {
                    center: { lat: 0, lng: 0 },
                    zoom: 15
                }
            );

        directionsServiceRef.current =
            new window.google.maps.DirectionsService();
        directionsRendererRef.current =
            new window.google.maps.DirectionsRenderer(
                {
                    map: mapInstanceRef.current,
                    panel: directionsPanelRef.current
                }
            );

        trafficLayerRef.current =
            new window.google.maps.TrafficLayer();
        trafficLayerRef.current.setMap(
            mapInstanceRef.current
        );

        if (navigator.geolocation) {
            watchIdRef.current =
                navigator.geolocation.watchPosition(
                    position => {
                        const pos = {
                            lat: position.coords
                                .latitude,
                            lng: position.coords
                                .longitude
                        };
                        setUserPosition(pos);
                        if (
                            userMarkerRef.current
                        ) {
                            userMarkerRef.current.setPosition(
                                pos
                            );
                        } else {
                            userMarkerRef.current =
                                new window.google.maps.Marker(
                                    {
                                        position:
                                            pos,
                                        map: mapInstanceRef.current
                                    }
                                );
                        }
                        if (!mapInitialized) {
                            mapInstanceRef.current.setCenter(
                                pos
                            );
                            setMapInitialized(
                                true
                            );
                        }
                    },
                    () => {
                        handleLocationError(
                            true,
                            mapInstanceRef.current.getCenter()
                        );
                    }
                );
        } else {
            handleLocationError(
                false,
                mapInstanceRef.current.getCenter()
            );
        }
    }, [mapInitialized]);

    const handleLocationError = (browserHasGeolocation, pos) => {
        // Implementar lógica de erro de geolocalização aqui
    };

    const calculateRoute = useCallback(() => {
        if (!destination) {
            alert('Por favor, insira um destino.');
            return;
        }

        if (userPosition && directionsServiceRef.current && directionsRendererRef.current) {
            directionsServiceRef.current.route(
                {
                    origin: userPosition,
                    destination: destination,
                    travelMode: window.google.maps.TravelMode[travelMode],
                },
                (result, status) => {
                    if (status === 'OK' && result) {
                        directionsRendererRef.current.setDirections(result);
                        setDirectionsResult(result);
                    } else {
                        console.error('Erro ao calcular rota:', status);
                    }
                }
            );
        }
    }, [destination, travelMode, userPosition]);

    const speakDirections = useCallback(() => {
        if (directionsResult && window.speechSynthesis) {
            const directions = directionsResult.routes[0].legs[0].steps;
            const instructions = directions.map((step) => step.instructions).join('. ');
            const utterance = new SpeechSynthesisUtterance(instructions);
            window.speechSynthesis.speak(utterance);
        }
    }, [directionsResult]);

    useEffect(() => {
        if (!googleMapsScriptLoaded) {
            const script = document.createElement('script');
            script.src = `${apiGoogleMapURL}?key=${apiGoogleMapKey}&libraries=places`;
            script.onload = () => {
                googleMapsScriptLoaded = true;
                initMap();
            };
            document.body.appendChild(script);
        } else if (!mapInitialized) {
            initMap();
        }

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [apiGoogleMapKey, apiGoogleMapURL, initMap, mapInitialized]);








    return (
        <ContainerGoogleMaps className="container container-google-map">
            <ContainerFormStyle className="container-form">
                <InputWidth
                    type="text"
                    id="destination"
                    className="form-control w-100 border border-secondary outline-transparent shadow-0"
                    style={{ boxShadow: 'none' }}
                    placeholder="Destino"
                    value={destination}
                    onChange={e =>
                        setDestination(
                            e.target.value
                        )
                    }
                />

                <InputGroup class="input-group mb-3">
                    <div class="input-group-prepend">
                        <label
                            class="input-group-text bg-secondary text-light rounded-end-0 border border-secondary"
                            for="inputGroupSelect01"
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
                            selected
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
                        className="btn btn-success d-grid gap-2 d-lg-block"
                        onClick={calculateRoute}
                    >
                        Calcular Rota
                    </button>
                    <button
                        className="btn btn-success d-grid gap-2 d-lg-block"
                        onClick={speakDirections}
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
    );
};

export default GoogleTravel;