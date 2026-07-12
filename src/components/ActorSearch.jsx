import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchTMDB, getImageUrl } from '../api/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Pagination from './Pagination';

const ActorSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const { t, lang } = useLanguage();
  const [actors, setActors] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const endpoint = query ? `/search/person?query=${encodeURIComponent(query)}&page=${page}` : `/person/popular?page=${page}`;
    fetchTMDB(endpoint, lang).then(data => {
      setActors(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalResults(data.total_results || 0);
    });
  }, [query, page, lang]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) setSearchParams({ q, page: 1 });
  };

  return (
    <div className="container">
      <h1>{query ? t('search_actors_title') + ': ' + query : t('popular_actors')}</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input type="text" name="q" defaultValue={query} placeholder={t('search_actors_placeholder')} />
        <button type="submit">{t('search_btn')}</button>
        {query && <Link to="/actors" className="reset-btn">{t('reset_btn')}</Link>}
      </form>
      {actors.length === 0 ? (
        <p>{query ? t('no_results') : 'Nema popularnih glumaca.'}</p>
      ) : (
        <>
          <div className="actor-grid">
            {actors.map(actor => (
              <Link to={`/actor?id=${actor.id}`} key={actor.id} className="actor-card">
                <img src={getImageUrl(actor.profile_path, 'w200')} alt={actor.name} />
                <div className="name">{actor.name}</div>
                <div className="known-for">
                  {actor.known_for?.map(k => k.title || k.name).slice(0,3).join(', ')}
                </div>
              </Link>
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={page} baseUrl={`/actors?q=${encodeURIComponent(query)}`} />
        </>
      )}
    </div>
  );
};

export default ActorSearch;