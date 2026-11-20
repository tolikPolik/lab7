import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setMovie(location.state?.movie || null);
    setPosterFailed(false);
    setStatus('loading');
    setError('');

    async function loadMovie() {
      if (!API_KEY) {
        setError('Не указан API-ключ OMDb в файле .env');
        setStatus('error');
        return;
      }

      try {
        const params = new URLSearchParams({ i: id, plot: 'full', apikey: API_KEY });
        const response = await fetch(`https://www.omdbapi.com/?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Ошибка сети');
        const data = await response.json();
        if (data.Response === 'False') throw new Error('Фильм не найден. Возможно, указан неверный ID.');
        setMovie(data);
        setStatus('success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setStatus('error');
        }
      }
    }

    loadMovie();
    return () => controller.abort();
  }, [id, location.state]);

  const posterUrl = movie && !posterFailed && movie.Poster && movie.Poster !== 'N/A'
    ? movie.Poster
    : '/no-poster.svg';

  return (
    <main className="page details-page">
      <button className="back-button" type="button" onClick={() => navigate(-1)}>← Назад</button>
      {status === 'loading' && <p className="status-message">Загрузка информации о фильме...</p>}
      {status === 'error' && (
        <div className="details-error">
          <p className="status-message status-message--error">Ошибка: {error}</p>
          <Link to="/search" className="text-link">Вернуться к поиску →</Link>
        </div>
      )}
      {movie && (
        <section className="details-card">
          <img className="details-card__poster" src={posterUrl} alt={`Постер фильма ${movie.Title}`} onError={() => setPosterFailed(true)} />
          <div className="details-card__content">
            <span className="eyebrow eyebrow--dark">ИНФОРМАЦИЯ О ФИЛЬМЕ</span>
            <h1>{movie.Title}</h1>
            <p className="details-card__year">{movie.Year}{movie.Runtime && movie.Runtime !== 'N/A' ? ` · ${movie.Runtime}` : ''}</p>
            {movie.Genre && movie.Genre !== 'N/A' && <p><strong>Жанр:</strong> {movie.Genre}</p>}
            {movie.Director && movie.Director !== 'N/A' && <p><strong>Режиссёр:</strong> {movie.Director}</p>}
            {movie.Actors && movie.Actors !== 'N/A' && <p><strong>Актёры:</strong> {movie.Actors}</p>}
            {movie.Country && movie.Country !== 'N/A' && <p><strong>Страна:</strong> {movie.Country}</p>}
            {movie.imdbRating && movie.imdbRating !== 'N/A' && <p><strong>Рейтинг IMDb:</strong> {movie.imdbRating}</p>}
            {status === 'loading' && <p className="details-card__loading">Загружается полное описание...</p>}
            {status === 'success' && (
              <div className="details-card__plot">
                <h2>Описание</h2>
                <p>{movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'Описание отсутствует.'}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default MovieDetailsPage;
