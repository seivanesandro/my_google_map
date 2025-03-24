import {
    render,
    screen,
    fireEvent
} from '@testing-library/react';
import GoogleMapsComponent from './GoogleMapsComponent';

beforeAll(() => {
    console.log(
        'Configuring mocks for Google Maps API and Geolocation API...'
    );
    global.google = {
        maps: {
            Map: jest.fn(() => {
                console.log('Mock Map called');
                return {
                    setCenter: jest.fn(),
                    setZoom: jest.fn()
                };
            }),
            Marker: jest.fn(() => {
                console.log('Mock Marker called');
                return {
                    setPosition: jest.fn()
                };
            }),
            DirectionsService: jest.fn(() => {
                console.log(
                    'Mock DirectionsService called'
                );
                return {
                    route: jest.fn(
                        (request, callback) => {
                            console.log(
                                'Mock route called with request:',
                                request
                            );
                            callback(
                                {
                                    routes: [
                                        {
                                            legs: [
                                                {
                                                    steps: [
                                                        {
                                                            instructions:
                                                                'Turn left',
                                                            end_location:
                                                                {
                                                                    lat: 0,
                                                                    lng: 0
                                                                }
                                                        },
                                                        {
                                                            instructions:
                                                                'Turn right',
                                                            end_location:
                                                                {
                                                                    lat: 1,
                                                                    lng: 1
                                                                }
                                                        }
                                                    ],
                                                    duration:
                                                        {
                                                            text: '10 mins'
                                                        }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                'OK'
                            );
                        }
                    )
                };
            }),
            DirectionsRenderer: jest.fn(() => {
                console.log(
                    'Mock DirectionsRenderer called'
                );
                return {
                    setDirections: jest.fn(),
                    setMap: jest.fn()
                };
            }),
            LatLng: jest.fn((lat, lng) => {
                console.log(
                    'Mock LatLng called with lat:',
                    lat,
                    'lng:',
                    lng
                );
                return { lat, lng };
            }),
            geometry: {
                spherical: {
                    computeDistanceBetween:
                        jest.fn(() => {
                            console.log(
                                'Mock computeDistanceBetween called'
                            );
                            return 10; // Retorna uma distância fixa
                        })
                }
            }
        }
    };

    global.navigator.geolocation = {
        getCurrentPosition: jest.fn(success => {
            console.log(
                'Mock getCurrentPosition called'
            );
            success({
                coords: {
                    latitude: 0,
                    longitude: 0
                }
            });
        }),
        watchPosition: jest.fn(success => {
            console.log(
                'Mock watchPosition called'
            );
            success({
                coords: {
                    latitude: 0,
                    longitude: 0
                }
            });
            return 1; // ID fictício para o watchPosition
        }),
        clearWatch: jest.fn(() => {
            console.log('Mock clearWatch called');
        })
    };
});

describe('GoogleMapsComponent', () => {
    it('renders the input and buttons', () => {
        console.log(
            'Running test: renders the input and buttons'
        );
        render(<GoogleMapsComponent />);
        expect(
            screen.getByPlaceholderText(
                'Enter destination'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText('Calculate Route')
        ).toBeInTheDocument();
    });

    it('shows "Start Navigation" button after calculating route', async () => {
        console.log(
            'Running test: shows "Start Navigation" button after calculating route'
        );
        render(<GoogleMapsComponent />);
        fireEvent.change(
            screen.getByPlaceholderText(
                'Enter destination'
            ),
            {
                target: {
                    value: 'Test Destination'
                }
            }
        );
        fireEvent.click(
            screen.getByText('Calculate Route')
        );
        expect(
            await screen.findByText(
                'Start Navigation'
            )
        ).toBeInTheDocument();
    });

    it('shows "Cancel Navigation" button when navigation starts', async () => {
        console.log(
            'Running test: shows "Cancel Navigation" button when navigation starts'
        );
        render(<GoogleMapsComponent />);
        fireEvent.change(
            screen.getByPlaceholderText(
                'Enter destination'
            ),
            {
                target: {
                    value: 'Test Destination'
                }
            }
        );
        fireEvent.click(
            screen.getByText('Calculate Route')
        );
        fireEvent.click(
            await screen.findByText(
                'Start Navigation'
            )
        );
        expect(
            await screen.findByText(
                'Cancel Navigation'
            )
        ).toBeInTheDocument();
    });

    it('cancels navigation when "Cancel Navigation" is clicked', async () => {
        console.log(
            'Running test: cancels navigation when "Cancel Navigation" is clicked'
        );
        render(<GoogleMapsComponent />);
        fireEvent.change(
            screen.getByPlaceholderText(
                'Enter destination'
            ),
            {
                target: {
                    value: 'Test Destination'
                }
            }
        );
        fireEvent.click(
            screen.getByText('Calculate Route')
        );
        fireEvent.click(
            await screen.findByText(
                'Start Navigation'
            )
        );
        fireEvent.click(
            await screen.findByText(
                'Cancel Navigation'
            )
        );
        expect(
            await screen.findByText(
                'Start Navigation'
            )
        ).toBeInTheDocument();
    });
});
