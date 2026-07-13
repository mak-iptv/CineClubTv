import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchTMDB, getImageUrl, VIDEO_SOURCES } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';

const Watch = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const type = params.get('type') || 'movie';
  const season = parseInt(params.get('season') || '1');
  const episode = parseInt(params.get('episode') || '1');
  const { t, lang } = useLanguage();

  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [source, setSource] = useState('embedSu');

  useEffect(() => {
    if (!id) return;
    const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    fetchTMDB(endpoint, lang).then(setDetails);
    fetchTMDB(`/${type}/${id}/credits`, lang).then(data => setCast(data.cast?.slice(0,10) || []));
  }, [id, type, lang]);

  if (!details) return <div className="loading">{t('loading')}</div>;

  const title = type === 'movie' ? details.title : details.name;
  const poster = details.poster_path;
  const overview = details.overview || t('no_description');
  const date = type === 'movie' ? details.release_date : details.first_air_date;
  const vote = details.vote_average;

  const sourceObj = VIDEO_SOURCES[source];
  let playerUrl = '';
  if (sourceObj) {
    const urlTemplate = type === 'movie' ? sourceObj.movieUrl : sourceObj.tvUrl;
    playerUrl = urlTemplate.replace('{id}', id).replace('{season}', season).replace('{episode}', episode);
  }

  return (
    <div className="watch-container">
      <div className="video-wrapper">
        <iframe 
  src={playerUrl} 
  allowFullScreen 
  title="player"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
></iframe>
      </div>
      <div className="source-selector">
        {Object.keys(VIDEO_SOURCES).map(key => (
          <button key={key} onClick={() => setSource(key)} className={source === key ? 'active' : ''}>
            {VIDEO_SOURCES[key].name[lang] || key}
          </button>
        ))}
      </div>
      <div className="info-section">
        <img src={getImageUrl(poster, 'w500')} alt={title} className="poster" />
        <div className="details">
          <h1>{title}</h1>
          <div className="meta">
            🎬 {type === 'movie' ? 'Film' : 'Serija'} • 📅 {date ? new Date(date).getFullYear() : 'N/A'} • ⭐ {vote?.toFixed(1)}/10
          </div>
          <p>{overview}</p>
          <div className="cast-container">
            <h3>{t('cast_label')}</h3>
            <div className="cast-grid">
              {cast.map(actor => (
                <div key={actor.id} className="cast-card">
                  <img src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} />
                  <Link to={`/actor?id=${actor.id}`}>{actor.name}</Link>
                  <span>{actor.character}</span>
                </div>
              ))}
            </div>
          </div>
          <Link to={type === 'tv' ? '/tv' : '/'} className="back-link">← {t('back_to_home')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Watch;
