import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api/tmdb';

const MovieCard = ({ item, type }) => {
  const title = type === 'movie' ? item.title : item.name;
  const date = type === 'movie' ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : 'N/A';
  const isNew = date && (new Date() - new Date(date)) / (1000*60*60*24) <= 30;
  const badgeColor = type === 'movie' ? '#3b82f6' : '#f59e0b';

  return (
    <Link to={`/watch?id=${item.id}&type=${type}`} className="movie-card">
      <img src={getImageUrl(item.poster_path, 'w200')} alt={title} loading="lazy" />
      <div className="info">
        <div className="title">{title}</div>
        <div className="year">
          {year}
          {isNew && <span className="new-badge">NEW</span>}
          <span className="badge" style={{ background: badgeColor }}>{type === 'movie' ? 'Film' : 'Serija'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;