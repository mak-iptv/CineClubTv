import React, { useEffect, useState } from 'react';
import { fetchTMDB, getVideoUrl, VIDEO_SOURCES } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Slider from './Slider';
import MovieCard from './MovieCard';
import Marquee from './Marquee';

const Home = () => {
  const { t, lang } = useLanguage();

  // --- STATE ЗА ПРЕБАРУВАЊЕ ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- STATE ЗА ФИЛМ ПЛЕЕР ---
  const [movies, setMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [movieUrl, setMovieUrl] = useState('');
  const [activeMovieSource, setActiveMovieSource] = useState('embedSu');

  // --- Вчитување на податоци (само филмови) ---
  useEffect(() => {
    fetchTMDB('/movie/popular', lang).then(data => setMovies(data.results?.slice(0,20) || []));
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

  // --- Функции за ФИЛМ ПЛЕЕР ---
  const changeMovieSource = (sourceKey) => {
    if (!featuredMovie) return;
    const url = getVideoUrl(sourceKey, 'movie', featuredMovie.id);
    setMovieUrl(url);
    setActiveMovieSource(sourceKey);
  };

  // --- Функции за пребарување (исто како порано) ---
  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const [movieData, tvData] = await Promise.all([
        fetchTMDB(`/search/movie?query=${encodeURIComponent(trimmed)}`, lang),
        fetchTMDB(`/search/tv?query=${encodeURIComponent(trimmed)}`, lang),
      ]);
      const combined = [
        ...(movieData.results || []).map(item => ({ ...item, media_type: 'movie' })),
        ...(tvData.results || []).map(item => ({ ...item, media_type: 'tv' })),
      ];
      setSearchResults(combined);
    } catch (error) {
      console.error('Грешка при пребарување:', error);
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  return (
    <>
      <Marquee />

      {/* Лента за пребарување */}
      <div style={{ padding: '16px 20px', background: '#1a1a1a', margin: '10px 0', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', border: '1px solid #333' }}>
        <input
          type="text"
          placeholder={t('search_placeholder') || 'Пребарај филм или серија...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, minWidth: '200px', padding: '12px 16px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
        />
        <button onClick={handleSearch} style={{ padding: '12px 28px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
          🔍 {t('search') || 'Пребарај'}
        </button>
        {isSearching && (
          <button onClick={clearSearch} style={{ padding: '12px 16px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>
            ✕
          </button>
        )}
      </div>

      {/* Приказ на резултати или почетна содржина */}
      {isSearching ? (
        <section className="category">
          <h2>{t('search_results') || 'Резултати од пребарување'} <span className="see-all">{searchResults.length}</span></h2>
          {searchResults.length === 0 ? (
            <p style={{ color: '#aaa', padding: '30px 0' }}>😕 Нема резултати за „{searchQuery}“.</p>
          ) : (
            <div className="movie-grid">
              {searchResults.map((item) => (
                <MovieCard key={`${item.media_type}-${item.id}`} item={item} type={item.media_type} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ФИЛМСКИ ПЛЕЕР */}
          {movieUrl && featuredMovie && (
            <div className="featured-player" style={{ padding: '20px', background: '#0a0a0a', margin: '10px 0', borderRadius: '12px' }}>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>
                🎬 {t('now_playing')}: {featuredMovie.title || featuredMovie.name}
              </h3>
              <iframe src={movieUrl} width="100%" height="450" frameBorder="0" allowFullScreen title="Movie Player" style={{ borderRadius: '8px' }}></iframe>
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

          {/* Слајдер */}
          <Slider items={nowPlaying} />

          {/* Грид со популарни филмови */}
          <section className="category">
            <h2>{t('popular_movies')} <span className="see-all">{t('showing')} {movies.length}</span></h2>
            <div className="movie-grid">
              {movies.map((m) => (
                <MovieCard key={m.id} item={m} type="movie" />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Home;
