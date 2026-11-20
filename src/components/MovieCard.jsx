import { useState } from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  const [posterFailed, setPosterFailed] = useState(false);
  const posterUrl = !posterFailed && movie.Poster && movie.Poster !== 'N/A'
    ? movie.Poster
    : '/no-poster.svg';

  return (
    <article className="movie-card">
      <Link to={`/movie/${movie.imdbID}`} state={{ movie }} className="movie-card__link">
        <img
          className="movie-card__poster"
          src={posterUrl}
          alt={`Постер фильма ${movie.Title}`}
          loading="lazy"
          onError={() => setPosterFailed(true)}
        />
        <div className="movie-card__content">
          <h3>{movie.Title}</h3>
          <p>Год: {movie.Year}</p>
          <span className="movie-card__more">Подробнее о фильме →</span>
        </div>
      </Link>
    </article>
  );
}

export default MovieCard;
