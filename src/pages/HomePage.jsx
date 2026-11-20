import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard.jsx';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      setStatus('loading');
      setError('');

      if (!API_KEY) {
        setError('Не указан API-ключ OMDb в файле .env');
        setStatus('error');
        return;
      }

      try {
        const searches = ['Marvel', 'Avengers'];
        let data = null;

        for (const title of searches) {
          const params = new URLSearchParams({ s: title, apikey: API_KEY, page: '1' });
          const response = await fetch(`https://www.omdbapi.com/?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('Ошибка сети');
          data = await response.json();
          if (data.Response === 'True') break;
          if (!/too many results/i.test(data.Error || '')) break;
        }

        if (data.Response === 'False') throw new Error(data.Error || 'Не удалось получить фильмы');
        if (!controller.signal.aborted) {
          setMovies(data.Search || []);
          setStatus('success');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setStatus('error');
        }
      }
    }

    loadMovies();
    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <span className="eyebrow">ЛАБОРАТОРНАЯ РАБОТА № 7</span>
        <h1>Найди фильм на вечер</h1>
        <p>Смотри подборку на главной, ищи фильмы по названию и открывай подробную информацию.</p>
        <Link to="/search" className="primary-link">Перейти к поиску →</Link>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <span className="eyebrow eyebrow--dark">ПОДБОРКА</span>
            <h2>Фильмы Marvel и супергерои</h2>
          </div>
          <Link to="/search?q=Marvel" className="text-link">Найти другие →</Link>
        </div>
        {status === 'loading' && <p className="status-message">Загрузка фильмов...</p>}
        {status === 'error' && <p className="status-message status-message--error">Ошибка: {error}</p>}
        {status === 'success' && movies.length === 0 && <p className="status-message">Ничего не найдено.</p>}
        {status === 'success' && movies.length > 0 && (
          <div className="movie-list">
            {movies.map((movie) => <MovieCard key={movie.imdbID} movie={movie} />)}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;
