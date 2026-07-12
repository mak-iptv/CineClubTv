import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Movies from './components/Movies';
import TV from './components/TV';
import Watch from './components/Watch';
import Actor from './components/Actor';
import ActorSearch from './components/ActorSearch';
import './styles/global.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TV />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/actor" element={<Actor />} />
            <Route path="/actors" element={<ActorSearch />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </LanguageProvider>
  );
}

export default App;