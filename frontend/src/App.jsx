import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExpenseFormPage from './pages/ExpenseFormPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import SummaryPage from './pages/SummaryPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="novo" element={<ExpenseFormPage />} />
          <Route path="gastos" element={<ExpensesPage />} />
          <Route path="gastos/:id" element={<ExpenseFormPage />} />
          <Route path="resumo" element={<SummaryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
