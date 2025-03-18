import React, { useEffect, useRef, useState } from 'react';
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

let googleMapsScriptLoaded = false; // Variável de controle para verificar se o script do Google Maps já foi carregado

const GoogleTravel = () => {
    // Referências para os elementos do DOM
    const mapRef = useRef(null); // Elemento onde o mapa será renderizado
    const directionsPanelRef = useRef(null); // Elemento onde as instruções da rota serão exibidas

    // Chave da API do Google Maps (substitua pela sua chave real)
    const apiGoogleMapKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const apiGoogleMapURL = process.env.REACT_APP_GOOGLE_MAPS_API_URL;

    // Estados do componente
    const [map, setMap] = useState(null); // Instância do mapa
    const [directionsRenderer, setDirectionsRenderer] = useState(null); // Renderizador de rotas
    const [directionsService, setDirectionsService] = useState(null); // Serviço de rotas
    const [trafficLayer, setTrafficLayer] = useState(null); // Camada de tráfego
    const [userMarker, setUserMarker] = useState(null); // Marcador do usuário
    const [userPosition, setUserPosition] = useState(null); // Posição do usuário
    const [destination, setDestination] = useState(''); // Destino da rota
    const [travelMode, setTravelMode] = useState('DRIVING'); // Modo de viagem padrão
    const [directionsResult, setDirectionsResult] = useState(null); // Resultado da rota

    // Efeito para carregar a API do Google Maps e inicializar o mapa
    useEffect(() => {
        // Verifica se a API já foi carregada
         if (
             !window.google &&
             !googleMapsScriptLoaded
         ) {
             // Verifica a variável de controle

             // Cria um novo script para carregar a API
             const script =
                 document.createElement('script');
             script.src = `${apiGoogleMapURL}?key=${apiGoogleMapKey}&callback=initMap`; // URL da API com a chave e callback
             script.defer = true;
             script.async = true;

             // Função de callback chamada quando a API é carregada
             window.initMap = () => {
                 console.log(
                     'API do Google Maps carregada'
                 );
                 console.log(
                     'mapRef.current:',
                     mapRef.current
                 );

                 // Verifica se a geolocalização é suportada
                 if (navigator.geolocation) {
                     // Monitora a posição do usuário continuamente
                     navigator.geolocation.watchPosition(
                         position => {
                             try {
                                 // Cria um objeto com a posição do usuário
                                 const pos = {
                                     lat: position
                                         .coords
                                         .latitude,
                                     lng: position
                                         .coords
                                         .longitude
                                 };
                                 setUserPosition(
                                     pos
                                 );

                                 // Inicializa o mapa se ainda não foi inicializado
                                 if (!map) {
                                     if (
                                         mapRef.current
                                     ) {
                                         const newMap =
                                             new window.google.maps.Map(
                                                 mapRef.current,
                                                 {
                                                     center: pos,
                                                     zoom: 12
                                                 }
                                             );
                                         const newDirectionsRenderer =
                                             new window.google.maps.DirectionsRenderer(
                                                 {
                                                     map: newMap,
                                                     panel: directionsPanelRef.current
                                                 }
                                             );
                                         const newDirectionsService =
                                             new window.google.maps.DirectionsService();
                                         const newUserMarker =
                                             new window.google.maps.Marker(
                                                 {
                                                     position:
                                                         pos,
                                                     map: newMap,
                                                     title: 'Sua localização'
                                                 }
                                             );

                                         // Inicializa e armazena a camada de tráfego no estado
                                         const newTrafficLayer =
                                             new window.google.maps.TrafficLayer();
                                         setTrafficLayer(
                                             newTrafficLayer
                                         );

                                         setMap(
                                             newMap
                                         );
                                         setDirectionsRenderer(
                                             newDirectionsRenderer
                                         );
                                         setDirectionsService(
                                             newDirectionsService
                                         );
                                         setUserMarker(
                                             newUserMarker
                                         );
                                     }
                                 } else {
                                     // Atualiza a posição do marcador e centraliza o mapa
                                     userMarker.setPosition(
                                         pos
                                     );
                                     map.setCenter(
                                         pos
                                     );
                                 }
                             } catch (error) {
                                 console.error(
                                     'Erro de geolocalização:',
                                     error
                                 );
                                 alert(
                                     'Erro: Falha ao obter a localização.'
                                 );
                             }
                         },
                         error => {
                             console.error(
                                 'Erro de geolocalização:',
                                 error
                             );
                             alert(
                                 'Erro: Falha ao obter a localização.'
                             );
                         }
                     );
                 } else {
                     alert(
                         'Erro: Navegador não suporta geolocalização.'
                     );
                 }
             };

             script.onload = () => {
                 googleMapsScriptLoaded = true; // Define a variável de controle como true
             };

             document.head.appendChild(script);
         } else if (window.google) {
             // Se a API já estiver carregada, chama a função de inicialização
             window.initMap();
         }
    }, [apiGoogleMapKey, apiGoogleMapURL, map, userMarker]);

    // Função para calcular a rota
    const calculateRoute = () => {
        if (directionsService && directionsRenderer && userPosition) {
            try {
                // Calcula a rota usando o serviço de rotas
                directionsService.route(
                    {
                        origin: userPosition,
                        destination: destination,
                        travelMode: window.google.maps.TravelMode[travelMode],
                        optimizeWaypoints: true
                    },
                    (response, status) => {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(response);
                            setDirectionsResult(response);

                            // Exibe a camada de tráfego automaticamente
                            if (trafficLayer) {
                                trafficLayer.setMap(map);
                            }
                        } else {
                            window.alert('Directions request failed due to ' + status);
                        }
                    }
                );
            } catch (error) {
                console.error('Erro ao calcular rota:', error);
            }
        } else {
            alert('A sua localização ainda não foi determinada ou o destino está vazio.');
        }
    };

    // Função para ler as instruções da rota em voz alta
    const speakDirections = () => {
        if (directionsResult && directionsResult.routes && directionsResult.routes.length > 0 && directionsResult.routes[0].legs && directionsResult.routes[0].legs.length > 0 && directionsResult.routes[0].legs[0].steps && 'speechSynthesis' in window) {
            const steps = directionsResult.routes[0].legs[0].steps;
            const speech = new SpeechSynthesisUtterance();
            speech.lang = 'pt-BR';
            let text = '';
            steps.forEach(step => {
                text += step.instructions + '. ';
            });
            speech.text = text;
            window.speechSynthesis.speak(speech);
        } else {
            if (!directionsResult) {
                alert('A rota ainda não foi calculada.');
            } else if (!('speechSynthesis' in window)) {
                alert('A síntese de voz não é suportada no seu navegador.');
            } else {
                alert('Não foi possível obter as instruções de rota.');
            }
        }
    };

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