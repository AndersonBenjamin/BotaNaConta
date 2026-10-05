import { NavLink } from 'react-router';
import Icon from './Icon.jsx';

const linkClass = ({ isActive }) => `bottom-nav__link${isActive ? ' is-active' : ''}`;

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <NavLink to="/" end className={linkClass}>
        <Icon name="home" />
        <span>Início</span>
      </NavLink>

      <NavLink to="/novo" className={linkClass} aria-label="Novo gasto">
        <span className="bottom-nav__add">
          <Icon name="plus" strokeWidth={2.4} />
        </span>
        <span>Gasto</span>
      </NavLink>

      <NavLink to="/resumo" className={linkClass}>
        <Icon name="pie" />
        <span>Resumo</span>
      </NavLink>
    </nav>
  );
}
