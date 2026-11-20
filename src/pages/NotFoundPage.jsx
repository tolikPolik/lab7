import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="page not-found">
      <span className="not-found__number">404</span>
      <h1>Страница не найдена</h1>
      <p>Такой страницы нет. Можно вернуться на главную или поискать фильм.</p>
      <Link to="/" className="primary-link">На главную →</Link>
    </main>
  );
}

export default NotFoundPage;
