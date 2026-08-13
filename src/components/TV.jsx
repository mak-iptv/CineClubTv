import React, { useEffect, useState } from 'react';
// ⬇️ ДОДАДЕНИ ИМПОРТИ ЗА ВИДЕО И СЕРВЕРИ
import { fetchTMDB, getVideoUrl, VIDEO_SOURCES } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from './MovieCard';

const TV = () => {
  const { t, lang } = useLanguage();
  const [shows, setShows] = useState([]);

  // --- STATE ЗА ТВ ПЛЕЕР (сезона/епизода/сервери) ---
  const [selectedShow, setSelectedShow] = useState(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [activeSource, setActiveSource] = useState('embedSu');

  // --- Вчитување на популарни ТВ серии ---
  useEffect(() => {
    fetchTMDB('/tv/popular', lang).then(data => {
      const results = data.results?.slice(0, 30) || [];
      setShows(results);
      
      // Автоматски избери ја ПРВАТА серија и вчитај видео
      if (results.length > 0) {
        const firstShow = results[0];
        setSelectedShow(firstShow);
        const url = getVideoUrl('embedSu', 'tv', firstShow.id, 1, 1);
        setVideoUrl(url);
        setActiveSource('embedSu');
        setSeason(1);
        setEpisode(1);
      }
    });
  }, [lang]);

  // --- Функција за промена на серија (од паѓачко мени) ---
  const handleShowChange = (e) => {
    const id = Number(e.target.value);
    const show = shows.find(s => s.id === id);
    setSelectedShow(show);
    if (show) {
      // Ресетирај на сезона 1, епизода 1 и вчитај
      setSeason(1);
      setEpisode(1);
      const url = getVideoUrl(activeSource, 'tv', show.id, 1, 1);
      setVideoUrl(url);
    }
  };

  // --- Функција за промена на сезона/епизода (преку инпути) ---
  const handleSeasonChange = (e) => {
    const val = Number(e.target.value) || 1;
    setSeason(val);
    if (selectedShow) {
      const url = getVideoUrl(activeSource, 'tv', selectedShow.id, val, episode);
      setVideoUrl(url);
    }
  };

  const handleEpisodeChange = (e) => {
    const val = Number(e.target.value) || 1;
    setEpisode(val);
    if (selectedShow) {
      const url = getVideoUrl(activeSource, 'tv', selectedShow.id, season, val);
      setVideoUrl(url);
    }
  };

  // --- Рачно вчитување (преку копче "Вчитај") ---
  const loadVideo = () => {
    if (!selectedShow) {
      alert('Избери серија прво!');
      return;
    }
    const url = getVideoUrl(activeSource, 'tv', selectedShow.id, season, episode);
    setVideoUrl(url);
  };

  // --- Промена на сервер (извор) ---
  const changeSource = (sourceKey) => {
    if (!selectedShow) return;
    setActiveSource(sourceKey);
    const url = getVideoUrl(sourceKey, 'tv', selectedShow.id, season, episode);
    setVideoUrl(url);
  };

  return (
    <>
      {/* ========================================================== */}
      {/* 1. ТВ ПЛЕЕР - ИЗНАД ГРИДОТ СО СЕРИИ */}
      {/* ========================================================== */}
      <div style={{ 
        padding: '20px', 
        background: '#0d0d0d', 
        margin: '10px 0 20px 0',
        borderRadius: '12px',
        border: '1px solid #2a2a2a'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>
          📺 {t('popular_tv')} - Гледај сега
        </h3>

        {/* Ред 1: Избор на серија */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#aaa', marginRight: '10px' }}>Избери серија:</label>
          <select 
            onChange={handleShowChange}
            value={selectedShow?.id || ''}
            style={{
              padding: '8px 12px',
              background: '#222',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              minWidth: '250px'
            }}
          >
            <option value="">-- Избери --</option>
            {shows.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.first_air_date?.slice(0,4)})</option>
            ))}
          </select>
        </div>

        {/* Ред 2: Контроли за сезона, епизода и копче Вчитај */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          alignItems: 'center', 
          marginBottom: '15px' 
        }}>
          <div>
            <label style={{ color: '#aaa', marginRight: '8px' }}>Сезона:</label>
            <input 
              type="number" 
              min="1" 
              max="20" 
              value={season}
              onChange={handleSeasonChange}
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
              value={episode}
              onChange={handleEpisodeChange}
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
            onClick={loadVideo}
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

        {/* Ред 3: Iframe плеер */}
        {videoUrl && selectedShow ? (
          <>
            <iframe
              src={videoUrl}
              width="100%"
              height="450"
              frameBorder="0"
              allowFullScreen
              title="TV Player"
              style={{ borderRadius: '8px' }}
            ></iframe>

            {/* Ред 4: Копчиња за сервери (сите извори од VIDEO_SOURCES) */}
            <div style={{ 
              marginTop: '12px', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px' 
            }}>
              {Object.keys(VIDEO_SOURCES).map((key) => (
                <button
                  key={key}
                  onClick={() => changeSource(key)}
                  style={{
                    padding: '6px 14px',
                    background: activeSource === key ? '#e50914' : '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: '0.2s'
                  }}
                >
                  {VIDEO_SOURCES[key].name[lang] || key}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: '#666', padding: '20px 0' }}>
            {selectedShow ? 'Кликни "Вчитај" за да го прикажеш видеото.' : 'Избери серија од паѓачкото мени.'}
          </p>
        )}
      </div>

      {/* ========================================================== */}
      {/* 2. ГРИД СО СИТЕ ПОПУЛАРНИ СЕРИИ (ОСТАНАТО НЕПРОМЕНЕТО) */}
      {/* ========================================================== */}
      <section className="category">
        <h2>
          {t('popular_tv')} <span className="see-all">{t('showing')} {shows.length}</span>
        </h2>
        <div className="movie-grid">
          {shows.map(show => (
            <MovieCard key={show.id} item={show} type="tv" />
          ))}
        </div>
      </section>
    </>
  );
};

export default TV;
