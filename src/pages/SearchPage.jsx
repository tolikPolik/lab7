import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard.jsx';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const pageValue = Number(searchParams.get('page'));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const [query, setQuery] = useState(searchTerm);
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(searchTerm ? 'loading' : 'idle');
  const [error, setError] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('movieSearchHistory') || '[]');
      return Array.isArray(saved) ? saved.slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setMovies([]);
      setTotal(0);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();

    async function loadMovies() {
      setStatus('loading');
      setError('');
      setMovies([]);

      if (!API_KEY) {
        setStatus('error');
        setError('Не указан API-ключ OMDb в файле .env');
        return;
      }

      try {
        const params = new URLSearchParams({
          s: searchTerm,
          apikey: API_KEY,
          page: String(page),
        });
        const response = await fetch(`https://www.omdbapi.com/?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Ошибка сети');
        const data = await response.json();

        if (data.Response === 'False') {
          if (/not found/i.test(data.Error || '')) {
            setMovies([]);
            setTotal(0);
            setStatus('success');
            return;
          }
          if (/too many results/i.test(data.Error || '')) {
            throw new Error('Слишком много результатов. Уточните название фильма. Например, Spider-Man: Homecoming.');
          }
          throw new Error(data.Error || 'Не удалось найти фильмы');
        }

        setMovies(data.Search || []);
        setTotal(Number(data.totalResults) || 0);
        setStatus('success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setMovies([]);
          setTotal(0);
          setError(err.message);
          setStatus('error');
        }
      }
    }

    loadMovies();
    return () => controller.abort();
  }, [searchTerm, page]);

  function startSearch(text) {
    if (status === 'loading') return;
    const value = text.trim();

    if (!value) {
      setStatus('error');
      setError('Введите название фильма');
      return;
    }

    const nextHistory = [value, ...history.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 5);
    setHistory(nextHistory);
    localStorage.setItem('movieSearchHistory', JSON.stringify(nextHistory));
    setQuery(value);
    setSearchParams({ q: value, page: '1' });
  }

  function changePage(nextPage) {
    if (status === 'loading') return;
    setSearchParams({ q: searchTerm, page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const invalidYears = yearFrom !== '' && yearTo !== '' && Number(yearFrom) > Number(yearTo);
  const filteredMovies = invalidYears ? [] : movies.filter((movie) => {
    const year = Number.parseInt(movie.Year, 10);
    if (yearFrom !== '' && year < Number(yearFrom)) return false;
    if (yearTo !== '' && year > Number(yearTo)) return false;
    return true;
  });
  const totalPages = Math.ceil(total / 10);

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow eyebrow--dark">ПОИСК ФИЛЬМОВ</span>
        <h1>Какой фильм ищем?</h1>
        <p>Введи название на английском языке, например Titanic или Spider-Man: Homecoming.</p>
      </header>

      <section className="search-panel">
        <form className="search-form" onSubmit={(event) => { event.preventDefault(); startSearch(query); }}>
          <label htmlFor="movie-query">Название фильма</label>
          <div className="search-form__row">
            <input
              id="movie-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Например, The Matrix"
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Загрузка...' : 'Найти'}
            </button>
          </div>
        </form>

        <div className="year-filter">
          <div>
            <label htmlFor="year-from">Год от</label>
            <input id="year-from" type="number" min="1888" max="2100" placeholder="1900" value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} />
          </div>
          <div>
            <label htmlFor="year-to">Год до</label>
            <input id="year-to" type="number" min="1888" max="2100" placeholder="2026" value={yearTo} onChange={(event) => setYearTo(event.target.value)} />
          </div>
        </div>
        {invalidYears && <p className="filter-error">Начальный год не может быть больше конечного.</p>}

        {history.length > 0 && (
          <div className="history">
            <span>История поиска:</span>
            <div className="history__items">
              {history.map((item) => (
                <button type="button" key={item} disabled={status === 'loading'} onClick={() => startSearch(item)}>{item}</button>
              ))}
            </div>
          </div>
        )}
      </section>

      {status === 'idle' && <p className="status-message">Введите название фильма и нажмите «Найти».</p>}
      {status === 'loading' && <p className="status-message">Загрузка фильмов...</p>}
      {status === 'error' && <p className="status-message status-message--error">Ошибка: {error}</p>}

      {status === 'success' && (
        <section className="section results">
          <div className="section__heading">
            <h2>Результаты поиска</h2>
            <span className="results__count">{total > 0 ? `Всего найдено: ${total}` : 'Ничего не найдено'}</span>
          </div>
          {filteredMovies.length === 0 ? (
            <p className="status-message">{total === 0 ? 'Ничего не найдено. Попробуйте английское название фильма.' : 'На этой странице нет фильмов за выбранные годы.'}</p>
          ) : (
            <div className="movie-list">
              {filteredMovies.map((movie) => <MovieCard key={movie.imdbID} movie={movie} />)}
            </div>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>← Предыдущая</button>
              <span>Страница {page} из {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Следующая →</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default SearchPage;
