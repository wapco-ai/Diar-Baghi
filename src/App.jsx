import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Page imports
import LangPage from './pages/LangPage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import HelpPage from './pages/HelpPage';
import SearchPage from './pages/SearchPage';
import MapPage from './pages/MapPage';
import FavouritePage from './pages/FavouritePage';
import DetailPage from './pages/DetailPage';
import GraveReservation from './pages/GraveReservation';
import ReminderPage from './pages/ReminderPage';

import './App.css';

function App() {
  const [isRTL, setIsRTL] = useState(document.documentElement.dir === 'rtl');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsRTL(document.documentElement.dir === 'rtl');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Router>
      <ToastContainer
        position={isRTL ? 'top-left' : 'top-right'}
        rtl={isRTL}
        toastClassName="custom-toast"
      />
      <Routes>
        <Route path="/" element={<LangPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/HelpPage" element={<HelpPage />} />
        <Route path="/SearchPage" element={<SearchPage />} />
        <Route path="/MapPage" element={<MapPage />} />
        <Route path="/FavouritePage" element={<FavouritePage />} />
        <Route path="/DetailPage" element={<DetailPage />} />
        <Route path="/GraveReservation" element={<GraveReservation />} />
        <Route path="/ReminderPage" element={<ReminderPage />} />
      </Routes>
    </Router>
  );
}

export default App;