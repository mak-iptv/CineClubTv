// src/components/Actor.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchTMDB, getImageUrl } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from './MovieCard';  // <-- DODAJ OVO

const Actor = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { t, lang } = useLanguage();
  const [person, setPerson] = useState(null);
  const [movies, setMovies] = useState([]);
  const [tv, setTv] = useState([]);

  useEffect(() => {
    if (!id) return;
    fetchTMDB(`/person/${id}`, lang).then(data => setPerson(data));
    fetchTMDB(`/person/${id}/combined_credits`, lang).then(data => {
      const cast = data.cast || [];
      setMovies(cast.filter(c => c.media_type === 'movie').slice(0, 30));
      setTv(cast.filter(c => c.media_type === 'tv').slice(0, 30));
    });
  }, [id, lang]);

  if (!person) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="actor-container">
      <div className="actor-profile">
        <img src={getImageUrl(person.profile_path, 'w500')} alt={person.name} />
        <div className="info">
          <h1>{person.name}</h1>
          <div className="meta">
            {person.birthday && <span><strong>Rođen:</strong> {new Date(person.birthday).toLocaleDateString()}</span>}
            {person.place_of_birth && <span><strong>Mesto:</strong> {person.place_of_birth}</span>}
          </div>
          <p>{person.biography || t('no_description')}</p>
        </div>
      </div>
      <h2>🎬 Filmovi ({movies.length})</h2>
      <div className="movie-grid">
        {movies.map(m => <MovieCard key={m.id} item={m} type="movie" />)}
      </div>
      <h2>📺 Serije ({tv.length})</h2>
      <div className="movie-grid">
        {tv.map(m => <MovieCard key={m.id} item={m} type="tv" />)}
      </div>
    </div>
  );
};

export default Actor;