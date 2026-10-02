import { NavLink } from 'react-router';

const linkClass = ({ isActive }) => `bottom-nav__link${isActive ? ' is-active' : ''}`;

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <NavLink to="/" end className={linkClass}>
        <span className="bottom-nav__icon" aria-hidden="true">🏠</span>
        <span>Início</span>
      </NavLink>

      <NavLink to="/novo" className={linkClass} aria-label="Novo gasto">
        <span className="bottom-nav__add" aria-hidden="true">+</span>
        <span>Gasto</span>
      </NavLink>

      <NavLink to="/resumo" className={linkClass}>
        <span className="bottom-nav__icon" aria-hidden="true">📊</span>
        <span>Resumo</span>
      </NavLink>
    </nav>
  );
}
