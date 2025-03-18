import Footer from './components/footer/Footer';
import GoogleTravel from './components/googleTravel/GoogleTravel';

function App() {
  return (
      <div className="App">
          <h1 className='text-center text-light'>My travel Maps</h1>
          <GoogleTravel />
          <Footer />
      </div>
  );
}

export default App;
