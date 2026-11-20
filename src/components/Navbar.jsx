import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <NavLink to="/" className="brand" aria-label="На главную">
          <span className="brand__mark">▶</span>
          <span>КиноКаталог</span>
        </NavLink>
        <nav className="navbar" aria-label="Основная навигация">
          <NavLink to="/" end>Главная</NavLink>
          <NavLink to="/search">Поиск фильмов</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
