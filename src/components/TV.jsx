import React, { useEffect, useState } from 'react';
import { fetchTMDB } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from './MovieCard';

const TV = () => {
  const { t, lang } = useLanguage();
  const [tv, setTv] = useState([]);

  useEffect(() => {
    fetchTMDB('/tv/popular', lang).then(data => setTv(data.results?.slice(0,30) || []));
  }, [lang]);

  return (
    <section className="category">
      <h2>{t('popular_tv')} <span className="see-all">{t('showing')} {tv.length}</span></h2>
      <div className="movie-grid">
        {tv.map(m => <MovieCard key={m.id} item={m} type="tv" />)}
      </div>
    </section>
  );
};

export default TV;