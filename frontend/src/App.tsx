import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RedirectIfAuth } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoansPage from './pages/LoansPage';
import LoanDetailPage from './pages/LoanDetailPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route element={<RedirectIfAuth />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/products" element={<ProductsPage />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={['buyer']} />}>
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={['lender']} />}>
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/loans/:id" element={<LoanDetailPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}


