import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';

const Slider = ({ items }) => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const item = items[current];
  const bg = item.backdrop_path || item.poster_path;
  const bgUrl = getImageUrl(bg, 'w1280');

  return (
    <section className="slider-section">
      <div className="slider-slide" style={{ backgroundImage: `url(${bgUrl})` }}>
        <div className="slider-content">
          <span className="badge">{t('now_playing_badge')}</span>
          <h2>{item.title}</h2>
          <div className="slider-meta">
            <span>⭐ {item.vote_average?.toFixed(1)}/10</span>
            <span>📅 {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}</span>
          </div>
          <p>{item.overview || t('no_description')}</p>
          <Link to={`/watch?id=${item.id}&type=movie`} className="watch-btn">{t('watch_btn')}</Link>
        </div>
      </div>
      <div className="slider-dots">
        {items.map((_, i) => (
          <span key={i} className={i === current ? 'active' : ''} onClick={() => setCurrent(i)}></span>
        ))}
      </div>
    </section>
  );
};

export default Slider;