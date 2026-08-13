import React, { useEffect, useState } from 'react';
// ⬇️ ДОДАДЕНИ ИМПОРТИ ОД tmdb.js
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
  
  // ⬇️ НОВ STATE ЗА ТЕСТ ПЛЕЕР
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  useEffect(() => {
    fetchTMDB('/movie/popular', lang).then(data => setMovies(data.results?.slice(0,20) || []));
    fetchTMDB('/tv/popular', lang).then(data => setTv(data.results?.slice(0,20) || []));
    fetchTMDB('/movie/now_playing', lang).then(data => {
      const results = data.results?.slice(0,5) || [];
      setNowPlaying(results);
      
      // Ако има филмови, постави го првиот како "избран" и генерирај URL
      if (results.length > 0) {
        const first = results[0];
        setFeaturedMovie(first);
        // Користи 'embedSu' како стандарден извор (можеш да го смениш)
        const url = getVideoUrl('embedSu', 'movie', first.id);
        setCurrentVideoUrl(url);
      }
    });
  }, [lang]);

  // Функција за промена на видео изворот
  const changeVideoSource = (sourceKey) => {
    if (!featuredMovie) return;
    const url = getVideoUrl(sourceKey, 'movie', featuredMovie.id);
    setCurrentVideoUrl(url);
  };

  return (
    <>
      <Marquee />
      
      {/* ⬇️ НОВ ДЕЛ - ВИДЕО ПЛЕЕР СО ПОДДРШКА ЗА СЕРВЕРИ */}
      {currentVideoUrl && featuredMovie && (
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
            src={currentVideoUrl}
            width="100%"
            height="450"
            frameBorder="0"
            allowFullScreen
            title="Video Player"
            style={{ borderRadius: '8px' }}
          ></iframe>
          
          {/* КОПЧИЊА ЗА СИТЕ СЕРВЕРИ ОД VIDEO_SOURCES */}
          <div style={{ 
            marginTop: '12px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px' 
          }}>
            {Object.keys(VIDEO_SOURCES).map((key) => (
              <button
                key={key}
                onClick={() => changeVideoSource(key)}
                style={{
                  padding: '6px 14px',
                  background: currentVideoUrl.includes(key) ? '#e50914' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: '0.3s'
                }}
              >
                {VIDEO_SOURCES[key].name[lang] || key}
              </button>
            ))}
          </div>
        </div>
      )}

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
