import React, { useEffect, useState } from 'react';
import { fetchTMDB, getVideoUrl, VIDEO_SOURCES } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Slider from './Slider';
import MovieCard from './MovieCard';
import Marquee from './Marquee';

const Home = () => {
  const { t, lang } = useLanguage();
  const [movies, setMovies] = useState([]);
  const [tv, setTv] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);

  // --- STATE ЗА ФИЛМ ПЛЕЕР ---
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [movieUrl, setMovieUrl] = useState('');
  const [activeMovieSource, setActiveMovieSource] = useState('embedSu');

  // --- STATE ЗА ТВ ПЛЕЕР (СЕЗОНА/ЕПИЗОДА) ---
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [tvSeason, setTvSeason] = useState(1);
  const [tvEpisode, setTvEpisode] = useState(1);
  const [tvUrl, setTvUrl] = useState('');
  const [activeTvSource, setActiveTvSource] = useState('embedSu');

  // --- Вчитување на податоци ---
  useEffect(() => {
    fetchTMDB('/movie/popular', lang).then(data => setMovies(data.results?.slice(0,20) || []));
    fetchTMDB('/tv/popular', lang).then(data => setTv(data.results?.slice(0,20) || []));
    fetchTMDB('/movie/now_playing', lang).then(data => {
      const results = data.results?.slice(0,5) || [];
      setNowPlaying(results);
      if (results.length > 0) {
        setFeaturedMovie(results[0]);
        const url = getVideoUrl('embedSu', 'movie', results[0].id);
        setMovieUrl(url);
        setActiveMovieSource('embedSu');
      }
    });
  }, [lang]);

  // --- Функции за ФИЛМ ---
  const changeMovieSource = (sourceKey) => {
    if (!featuredMovie) return;
    const url = getVideoUrl(sourceKey, 'movie', featuredMovie.id);
    setMovieUrl(url);
    setActiveMovieSource(sourceKey);
  };

  // --- Функции за ТВ СЕРИЈА ---
  const loadTvVideo = (sourceKey) => {
    if (!selectedTvShow) {
      alert('Избери ТВ серија прво!');
      return;
    }
    const url = getVideoUrl(sourceKey, 'tv', selectedTvShow.id, tvSeason, tvEpisode);
    setTvUrl(url);
    setActiveTvSource(sourceKey);
  };

  // Кога ќе смениш сезона/епизода, автоматски ре-лоадирај со активниот извор
  const handleTvParamChange = (season, episode) => {
    setTvSeason(season);
    setTvEpisode(episode);
    if (selectedTvShow && activeTvSource) {
      const url = getVideoUrl(activeTvSource, 'tv', selectedTvShow.id, season, episode);
      setTvUrl(url);
    }
  };

  return (
    <>
      <Marquee />

      {/* ========================================================== */}
      {/* 1. ПЛЕЕР ЗА ФИЛМОВИ (како претходно) */}
      {/* ========================================================== */}
      {movieUrl && featuredMovie && (
        <div className="featured-player" style={{ 
          padding: '20px', 
          background: '#0a0a0a', 
          margin: '10px 0',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>
            🎬 {t('now_playing')}: {featuredMovie.title || featuredMovie.name}
          </h3>
          
          <iframe
            src={movieUrl}
            width="100%"
            height="450"
            frameBorder="0"
            allowFullScreen
            title="Movie Player"
            style={{ borderRadius: '8px' }}
          ></iframe>
          
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.keys(VIDEO_SOURCES).map((key) => (
              <button
                key={key}
                onClick={() => changeMovieSource(key)}
                style={{
                  padding: '6px 14px',
                  background: activeMovieSource === key ? '#e50914' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {VIDEO_SOURCES[key].name[lang] || key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. НОВ ПЛЕЕР ЗА ТВ СЕРИИ (со поддршка за сезона/епизода) */}
      {/* ========================================================== */}
      <div className="tv-player-section" style={{ 
        padding: '20px', 
        background: '#111', 
        margin: '10px 0',
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>
          📺 {t('popular_tv')} - Тест плеер
        </h3>

        {/* Избор на серија */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#aaa', marginRight: '10px' }}>Избери серија:</label>
          <select 
            onChange={(e) => {
              const id = Number(e.target.value);
              const show = tv.find(s => s.id === id);
              setSelectedTvShow(show);
              setTvUrl(''); // ресетирај го видеото
              if (show) {
                // Автоматски вчитај со тековната сезона/епизода
                const url = getVideoUrl(activeTvSource, 'tv', show.id, tvSeason, tvEpisode);
                setTvUrl(url);
              }
            }}
            style={{
              padding: '8px 12px',
              background: '#222',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            <option value="">-- Избери --</option>
            {tv.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.first_air_date?.slice(0,4)})</option>
            ))}
          </select>
        </div>

        {/* Контроли за сезона и епизода */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <label style={{ color: '#aaa', marginRight: '8px' }}>Сезона:</label>
            <input 
              type="number" 
              min="1" 
              max="20" 
              value={tvSeason}
              onChange={(e) => {
                const val = Number(e.target.value) || 1;
                handleTvParamChange(val, tvEpisode);
              }}
              style={{
                padding: '6px 10px',
                width: '60px',
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <div>
            <label style={{ color: '#aaa', marginRight: '8px' }}>Епизода:</label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              value={tvEpisode}
              onChange={(e) => {
                const val = Number(e.target.value) || 1;
                handleTvParamChange(tvSeason, val);
              }}
              style={{
                padding: '6px 10px',
                width: '60px',
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
            />
          </div>
          <button 
            onClick={() => loadTvVideo(activeTvSource)}
            style={{
              padding: '6px 20px',
              background: '#e50914',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Вчитај
          </button>
        </div>

        {/* Iframe за ТВ */}
        {tvUrl && selectedTvShow ? (
          <>
            <iframe
              src={tvUrl}
              width="100%"
              height="450"
              frameBorder="0"
              allowFullScreen
              title="TV Player"
              style={{ borderRadius: '8px' }}
            ></iframe>

            {/* Копчиња за сервери (ТВ) */}
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.keys(VIDEO_SOURCES).map((key) => (
                <button
                  key={key}
                  onClick={() => loadTvVideo(key)}
                  style={{
                    padding: '6px 14px',
                    background: activeTvSource === key ? '#e50914' : '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {VIDEO_SOURCES[key].name[lang] || key}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: '#666', padding: '20px 0' }}>
            {selectedTvShow ? 'Кликни "Вчитај" за да го прикажеш видеото.' : 'Избери серија од паѓачкото мени.'}
          </p>
        )}
      </div>

      {/* ========================================================== */}
      {/* 3. СЛАЈДЕР И ГРИД (ОСТАНАТО НЕПРОМЕНЕТО) */}
      {/* ========================================================== */}
      <Slider items={nowPlaying} />
      
      <section className="category">
        <h2>{t('popular_movies')} <span className="see-all">{t('showing')} {movies.length}</span></h2>
        <div className="movie-grid">
          {movies.map(m => <MovieCard key={m.id} item={m} type="movie" />)}
        </div>
      </section>
      
      <section className="category">
        <h2>{t('popular_tv')} <span className="see-all">{t('showing')} {tv.length}</span></h2>
        <div className="movie-grid">
          {tv.map(m => <MovieCard key={m.id} item={m} type="tv" />)}
        </div>
      </section>
    </>
  );
};

export default Home;
