import { Outlet } from 'react-router';
import BottomNav from './BottomNav.jsx';

export default function AppLayout() {
  return (
    <div className="app">
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
