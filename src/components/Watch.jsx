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
  const [source, setSource] = useState(Object.keys(VIDEO_SOURCES)[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Отстрани дупликати по id
        const uniqueCast = [];
        const seen = new Set();
        (creditsData.cast || []).forEach((actor) => {
          if (!seen.has(actor.id)) {
            seen.add(actor.id);
            uniqueCast.push(actor);
          }
        });
        setCast(uniqueCast);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, type, lang]);

  if (!id) return <div className="error">{t('missing_id') || 'Missing ID'}</div>;
  if (loading) return <div className="loading">{t('loading') || 'Loading...'}</div>;
  if (error) return <div className="error">{t('error') || 'Error'}: {error}</div>;
  if (!details) return <div className="error">{t('no_data') || 'No data found'}</div>;

  const title = type === 'movie' ? details.title : details.name;
  const poster = details.poster_path;
  const overview = details.overview || t('no_description') || 'No description available.';
  const date = type === 'movie' ? details.release_date : details.first_air_date;
  const vote = details.vote_average;
  const genres = details.genres ? details.genres.map((g) => g.name).join(', ') : '';

  const playerUrl = getVideoUrl(source, type, id, season, episode);

  const mainCast = cast.slice(0, 4);
  const otherCast = cast.slice(4);

  return (
    <div className="watch-container">
      {/* Видео Плеер */}
      <div className="video-wrapper">
        {playerUrl ? (
          <iframe
            key={source}
            src={playerUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            frameBorder="0"
            referrerPolicy="origin"
            allowFullScreen
            title="Video player"
          />
        ) : (
          <div className="no-player">
            {t('no_player_available') || 'No player available for this source.'}
          </div>
        )}
      </div>

      {/* Избор на извори */}
      <div className="source-selector">
        {Object.keys(VIDEO_SOURCES).map((key) => {
          const sourceName =
            VIDEO_SOURCES[key].name?.[lang] ||
            VIDEO_SOURCES[key].name?.en ||
            key;
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

      {/* Информации за филмот/серијата */}
      <div className="info-section">
        <img
          src={poster ? getImageUrl(poster, 'w500') : '/placeholder-poster.png'}
          alt={title}
          className="poster"
        />

        <div className="details">
          <h1>{title}</h1>

          <div className="meta">
            <span>🎬 {type === 'movie' ? (t('movie') || 'Film') : (t('tv_series') || 'Serija')}</span>
            <span>📅 {date ? new Date(date).getFullYear() : 'N/A'}</span>
            <span>⭐ {vote?.toFixed(1) || '?'}/10</span>
            {genres && <span>🎭 {genres}</span>}
          </div>

          <p className="overview">{overview}</p>

          {/* ГЛАВНИ УЛОГИ */}
          {mainCast.length > 0 && (
            <div className="cast-section">
              <h3 className="cast-title">{t('main_cast') || '⭐ Главни улоги'}</h3>
              <div className="cast-grid-main">
                {mainCast.map((actor) => (
                  <Link
                    to={`/actor?id=${actor.id}`}
                    key={actor.id}
                    className="actor-card-main"
                  >
                    <div className="actor-photo-wrapper">
                      {actor.profile_path ? (
                        <img
                          src={getImageUrl(actor.profile_path, 'w300')}
                          alt={actor.name}
                          className="actor-photo"
                          loading="lazy"
                        />
                      ) : (
                        <div className="actor-photo no-photo">👤</div>
                      )}
                    </div>
                    <div className="actor-info">
                      <span className="actor-name">{actor.name}</span>
                      {actor.character && (
                        <span className="actor-character">{actor.character}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ОСТАНАТИ АКТЕРИ */}
          {otherCast.length > 0 && (
            <div className="cast-section">
              <h3 className="cast-title">{t('cast_label') || '🎭 Останати актери'}</h3>
              <div className="cast-grid-all">
                {otherCast.map((actor) => (
                  <Link
                    to={`/actor?id=${actor.id}`}
                    key={actor.id}
                    className="actor-card-small"
                  >
                    <div className="actor-photo-wrapper-small">
                      {actor.profile_path ? (
                        <img
                          src={getImageUrl(actor.profile_path, 'w185')}
                          alt={actor.name}
                          className="actor-photo-small"
                          loading="lazy"
                        />
                      ) : (
                        <div className="actor-photo-small no-photo">👤</div>
                      )}
                    </div>
                    <div className="actor-info-small">
                      <span className="actor-name-small">{actor.name}</span>
                      {actor.character && (
                        <span className="actor-character-small">{actor.character}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link to={type === 'tv' ? '/tv' : '/'} className="back-link">
            ← {t('back_to_home') || 'Back to home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Watch;
