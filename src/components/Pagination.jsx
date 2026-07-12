import React from 'react';
import { Link } from 'react-router-dom';

const Pagination = ({ totalPages, currentPage, baseUrl }) => {
  if (totalPages <= 1) return null;

  const getPageUrl = (page) => `${baseUrl}&page=${page}`;

  return (
    <div className="pagination">
      {currentPage > 1 && <Link to={getPageUrl(currentPage - 1)}>‹ Prethodna</Link>}
      {[...Array(Math.min(totalPages, 10)).keys()].map(i => {
        const p = i + 1;
        return <Link key={p} to={getPageUrl(p)} className={p === currentPage ? 'active' : ''}>{p}</Link>;
      })}
      {currentPage < totalPages && <Link to={getPageUrl(currentPage + 1)}>Sledeća ›</Link>}
    </div>
  );
};

export default Pagination;