import React, { useEffect, useState } from 'react';
import { fetchTMDB, getVideoUrl, VIDEO_SOURCES } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Slider from './Slider';
import MovieCard from './MovieCard';
import Marquee from './Marquee';

const Home = () => {
  const { t, lang } = useLanguage();

  // --- STATE ЗА ПРЕБАРУВАЊЕ (НОВО) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- STATE ЗА ФИЛМ ПЛЕЕР ---
  const [movies, setMovies] = useState([]);
  const [tv, setTv] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [movieUrl, setMovieUrl] = useState('');
  const [activeMovieSource, setActiveMovieSource] = useState('embedSu');

  // --- STATE ЗА ТВ ПЛЕЕР (СЕЗОНА/ЕПИЗОДА) ---
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [tvSeason, setTvSeason] = useState(1);
  const [tvEpisode, setTvEpisode] = useState(1);
  const [tvUrl, setTvUrl] = useState('');
  const [activeTvSource, setActiveTvSource] = useState('embedSu');

  // --- Вчитување на податоци (постоечко) ---
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

  // --- Функции за ФИЛМ (постоечки) ---
  const changeMovieSource = (sourceKey) => {
    if (!featuredMovie) return;
    const url = getVideoUrl(sourceKey, 'movie', featuredMovie.id);
    setMovieUrl(url);
    setActiveMovieSource(sourceKey);
  };

  // --- Функции за ТВ (постоечки) ---
  const loadTvVideo = (sourceKey) => {
    if (!selectedTvShow) {
      alert('Избери ТВ серија прво!');
      return;
    }
    const url = getVideoUrl(sourceKey, 'tv', selectedTvShow.id, tvSeason, tvEpisode);
    setTvUrl(url);
    setActiveTvSource(sourceKey);
  };

  const handleTvParamChange = (season, episode) => {
    setTvSeason(season);
    setTvEpisode(episode);
    if (selectedTvShow && activeTvSource) {
      const url = getVideoUrl(activeTvSource, 'tv', selectedTvShow.id, season, episode);
      setTvUrl(url);
    }
  };

  // ============================================================
  // 🆕 НОВИ ФУНКЦИИ ЗА ПРЕБАРУВАЊЕ
  // ============================================================
  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      // Ако е празно, врати се на нормален приказ
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Пребарувај и филмови и ТВ серии во ист момент
      const [movieData, tvData] = await Promise.all([
        fetchTMDB(`/search/movie?query=${encodeURIComponent(trimmed)}`, lang),
        fetchTMDB(`/search/tv?query=${encodeURIComponent(trimmed)}`, lang),
      ]);

      // Комбинирај ги резултатите
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

  // Пребарување со копче ENTER
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Почисти го пребарувањето и врати се на почетниот приказ
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  return (
    <>
      <Marquee />

      {/* ========================================================== */}
      {/* 🆕 ЛЕНТА ЗА ПРЕБАРУВАЊЕ (СЕКОГАШ ВИДЛИВА) */}
      {/* ========================================================== */}
      <div
        style={{
          padding: '16px 20px',
          background: '#1a1a1a',
          margin: '10px 0',
          borderRadius: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          border: '1px solid #333',
        }}
      >
        <input
          type="text"
          placeholder={t('search_placeholder') || 'Пребарај филм или серија...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '12px 16px',
            background: '#222',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '6px',
            fontSize: '16px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 28px',
            background: '#e50914',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          🔍 {t('search') || 'Пребарај'}
        </button>
        {isSearching && (
          <button
            onClick={clearSearch}
            style={{
              padding: '12px 16px',
              background: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ========================================================== */}
      {/* 🆕 ПРИКАЖИ ГИ РЕЗУЛТАТИТЕ ОД ПРЕБАРУВАЊЕ (АКО ИМА) */}
      {/* ========================================================== */}
      {isSearching ? (
        <section className="category">
          <h2>
            {t('search_results') || 'Резултати од пребарување'}{' '}
            <span className="see-all">{searchResults.length}</span>
          </h2>
          {searchResults.length === 0 ? (
            <p style={{ color: '#aaa', padding: '30px 0' }}>
              😕 Нема резултати за „{searchQuery}“.
            </p>
          ) : (
            <div className="movie-grid">
              {searchResults.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  type={item.media_type} // 'movie' или 'tv'
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ========================================================== */}
          {/* 1. ПЛЕЕР ЗА ФИЛМОВИ (постоечки) */}
          {/* ========================================================== */}
          {movieUrl && featuredMovie && (
            <div
              className="featured-player"
              style={{
                padding: '20px',
                background: '#0a0a0a',
                margin: '10px 0',
                borderRadius: '12px',
              }}
            >
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
          {/* 2. ПЛЕЕР ЗА ТВ СЕРИИ (постоечки) */}
          {/* ========================================================== */}
          <div
            className="tv-player-section"
            style={{
              padding: '20px',
              background: '#111',
              margin: '10px 0',
              borderRadius: '12px',
              border: '1px solid #333',
            }}
          >
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>
              📺 {t('popular_tv')} - Тест плеер
            </h3>

            {/* Избор на серија */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#aaa', marginRight: '10px' }}>Избери серија:</label>
              <select
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const show = tv.find((s) => s.id === id);
                  setSelectedTvShow(show);
                  setTvUrl('');
                  if (show) {
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
                  minWidth: '200px',
                }}
              >
                <option value="">-- Избери --</option>
                {tv.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.first_air_date?.slice(0, 4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Контроли за сезона и епизода */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
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
                    borderRadius: '4px',
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
                    borderRadius: '4px',
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
                  fontWeight: 'bold',
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
                {selectedTvShow
                  ? 'Кликни "Вчитај" за да го прикажеш видеото.'
                  : 'Избери серија од паѓачкото мени.'}
              </p>
            )}
          </div>

          {/* ========================================================== */}
          {/* 3. СЛАЈДЕР И ГРИДОВИ (постоечки) */}
          {/* ========================================================== */}
          <Slider items={nowPlaying} />

          <section className="category">
            <h2>
              {t('popular_movies')} <span className="see-all">{t('showing')} {movies.length}</span>
            </h2>
            <div className="movie-grid">
              {movies.map((m) => (
                <MovieCard key={m.id} item={m} type="movie" />
              ))}
            </div>
          </section>

          <section className="category">
            <h2>
              {t('popular_tv')} <span className="see-all">{t('showing')} {tv.length}</span>
            </h2>
            <div className="movie-grid">
              {tv.map((m) => (
                <MovieCard key={m.id} item={m} type="tv" />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Home;
