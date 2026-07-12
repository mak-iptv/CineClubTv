// src/components/Movies.jsx
import React, { useEffect, useState } from 'react';
import { fetchTMDB } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from './MovieCard';

const Movies = () => {
  const { t, lang } = useLanguage();
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchTMDB('/movie/popular', lang).then(data => setMovies(data.results?.slice(0, 30) || []));
  }, [lang]);

  return (
    <section className="category">
      <h2>{t('popular_movies')} <span className="see-all">{t('showing')} {movies.length}</span></h2>
      <div className="movie-grid">
        {movies.map(m => <MovieCard key={m.id} item={m} type="movie" />)}
      </div>
    </section>
  );
};

export default Movies;