import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchActor, setSearchActor] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchActor.trim()) {
      navigate(`/actors?q=${encodeURIComponent(searchActor)}`);
    }
  };

  return (
    <header className="top-bar">
      <div className="logo">CINE<span>CLUB</span></div>
      <nav>
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          <i className="fas fa-home"></i> {t('nav_home')}
        </Link>
        <Link to="/movies" className={isActive('/movies') ? 'active' : ''}>
          <i className="fas fa-film"></i> {t('nav_movies')}
        </Link>
        <Link to="/tv" className={isActive('/tv') ? 'active' : ''}>
          <i className="fas fa-tv"></i> {t('nav_series')}
        </Link>
        <Link to="/actors" className={isActive('/actors') ? 'active' : ''}>
  <i className="fas fa-user"></i> {t('nav_actors')}
</Link>
      </nav>
      <div className="top-bar-right">
        <div className="online-indicator">
          <span className="dot"></span>
          <span>{t('online_label')}</span>
          <span className="count">{Math.floor(Math.random() * 130 + 120)}</span>
        </div>
        <div className="social-icons">
  <a href="https://t.me/+FcDQ_D71KOtlYjhk" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
    <i className="fa fa-telegram"></i>
  </a>
         </div> 
        <form className="actor-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={t('search_actors_placeholder')}
            value={searchActor}
            onChange={(e) => setSearchActor(e.target.value)}
          />
          <button type="submit"><i className="fas fa-user"></i></button>
        </form>
        <div className="language-switcher">
          <button onClick={() => setLang('sr')} className={lang === 'sr' ? 'active' : ''}>SRB</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
          <button onClick={() => setLang('sq')} className={lang === 'sq' ? 'active' : ''}>SQ</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
