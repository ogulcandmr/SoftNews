import React from 'react';
import Navbar from './components/Navbar'; // ← DOĞRU yol
import 'bootstrap/dist/css/bootstrap.min.css';
import MyCard from './components/Card'
import CustomCarousel from './components/CustomCarousel'
import YouTubeSection from './components/YoutubeSection';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';


const App = () => {
  return (
    <div>
      <Navbar />
      <CustomCarousel/>
      <MyCard />
      <YouTubeSection/>
    </div>
  );
};

export default App;