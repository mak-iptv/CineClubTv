// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { fetchTMDB } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Slider from './Slider';
import MovieCard from './MovieCard';
import Marquee from './Marquee';  // <-- DODAJ UVOZ

const Home = () => {
  const { t, lang } = useLanguage();
  const [movies, setMovies] = useState([]);
  const [tv, setTv] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);

  useEffect(() => {
    fetchTMDB('/movie/popular', lang).then(data => setMovies(data.results?.slice(0,20) || []));
    fetchTMDB('/tv/popular', lang).then(data => setTv(data.results?.slice(0,20) || []));
    fetchTMDB('/movie/now_playing', lang).then(data => setNowPlaying(data.results?.slice(0,5) || []));
  }, [lang]);

  return (
    <>
      {/* MARQUEE IZNAD SVAKOG SADRŽAJA */}
      <Marquee />
      
      {/* SLIDER */}
      <Slider items={nowPlaying} />
      
      {/* FILMOVI I SERIJE */}
      <section className="category">
        <h2>{t('popular_movies')} <span className="see-all">{t('showing')} {movies.length}</span></h2>
        <div className="movie-grid">
          {movies.map(m => <MovieCard key={m.id} item={m} type="movie" />)}
        </div>
      </section>
      <section className="category">
        <h2>{t('popular_tv')} <span className="see-all">{t('showing')} {tv.length}</span></h2>
        <div className="movie-grid">
          {tv.map(m => <MovieCard key={m.id} item={m} type="tv" />)}
        </div>
      </section>
    </>
  );
};

export default Home;