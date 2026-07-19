import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchTMDB, getImageUrl, getVideoUrl, VIDEO_SOURCES } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';

const Watch = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const type = params.get('type') || 'movie';
  const season = parseInt(params.get('season') || '1', 10);
  const episode = parseInt(params.get('episode') || '1', 10);
  const { t, lang } = useLanguage();

  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [source, setSource] = useState('embedSu');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Кога се менува id, type, lang – вчитај податоци
  useEffect(() => {
    if (!id) {
      setError('No ID provided');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
        const [detailsData, creditsData] = await Promise.all([
          fetchTMDB(endpoint, lang),
          fetchTMDB(`/${type}/${id}/credits`, lang),
        ]);
        setDetails(detailsData);
        setCast(creditsData.cast?.slice(0, 10) || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, type, lang]);

  // Ако нема id или сè уште се вчитува
  if (!id) {
    return <div className="error">{t('missing_id') || 'Missing ID'}</div>;
  }

  if (loading) {
    return <div className="loading">{t('loading') || 'Loading...'}</div>;
  }

  if (error) {
    return <div className="error">{t('error') || 'Error'}: {error}</div>;
  }

  if (!details) {
    return <div className="error">{t('no_data') || 'No data found'}</div>;
  }

  const title = type === 'movie' ? details.title : details.name;
  const poster = details.poster_path;
  const overview = details.overview || t('no_description') || 'No description available.';
  const date = type === 'movie' ? details.release_date : details.first_air_date;
  const vote = details.vote_average;

  // Генерирај URL за плеерот користејќи ја новата функција
  const playerUrl = getVideoUrl(source, type, id, season, episode);

  return (
    <div className="watch-container">
      <div className="video-wrapper">
        {playerUrl ? (
          <iframe
            src={playerUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            frameBorder="0"
            referrerPolicy="origin"
            allowFullScreen
            title="Video player"
          />
        ) : (
          <div className="no-player">{t('no_player_available') || 'No player available for this source.'}</div>
        )}
      </div>

      <div className="source-selector">
        {Object.keys(VIDEO_SOURCES).map((key) => {
          const sourceName = VIDEO_SOURCES[key].name[lang] || VIDEO_SOURCES[key].name.en || key;
          return (
            <button
              key={key}
              onClick={() => setSource(key)}
              className={source === key ? 'active' : ''}
            >
              {sourceName}
            </button>
          );
        })}
      </div>

      <div className="info-section">
        <img src={getImageUrl(poster, 'w500')} alt={title} className="poster" />
        <div className="details">
          <h1>{title}</h1>
          <div className="meta">
            🎬 {type === 'movie' ? (t('movie') || 'Film') : (t('tv_series') || 'Serija')} • 
            📅 {date ? new Date(date).getFullYear() : 'N/A'} • 
            ⭐ {vote?.toFixed(1) || '?'}/10
          </div>
          <p>{overview}</p>

          <div className="cast-container">
            <h3>{t('cast_label') || 'Cast'}</h3>
            <div className="cast-grid">
              {cast.map((actor) => (
                <div key={actor.id} className="cast-card">
                  <img src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} />
                  <Link to={`/actor?id=${actor.id}`}>{actor.name}</Link>
                  <span>{actor.character}</span>
                </div>
              ))}
            </div>
          </div>

          <Link to={type === 'tv' ? '/tv' : '/'} className="back-link">
            ← {t('back_to_home') || 'Back to home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Watch;
