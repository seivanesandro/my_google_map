import { useEffect } from 'react';
import Footer from './components/footer/Footer';
//import GoogleTravel from './components/googleTravel/GoogleTravel';
import GoogleMapsComponent from './components/googleTravel/GoogleMapsComponent';

function App() {
    useEffect(() => {
        const observer = new MutationObserver(
            mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(
                        node => {
                            if (
                                node.nodeName ===
                                    'SCRIPT' &&
                                node.src &&
                                node.src.includes(
                                    'maps.googleapis.com'
                                )
                            ) {
                                console.log(
                                    'Script da API do Google Maps adicionado:',
                                    node.src
                                );
                            }
                        }
                    );
                });
            }
        );

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);
  return (
      <div className="App">
          <h1 className='text-center text-light my-5'>My travel Maps</h1>
          {/* <GoogleTravel /> */}
          <GoogleMapsComponent />
          <Footer />
      </div>
  );
}

export default App;
