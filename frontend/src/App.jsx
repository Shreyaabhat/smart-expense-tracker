// ============================================
// App.jsx — Root component with routing
// ============================================

import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "./components/common/Toast";
import useToast from "./hooks/useToast";
import Navbar from "./components/common/Navbar";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseHistory from "./pages/ExpenseHistory";
import Analytics from "./pages/Analytics";
import PiggyBankPage from "./pages/PiggyBank";
import CurrencyConverter from "./pages/CurrencyConverter";
import Profile from "./pages/Profile";
import ExpenseHeatmap from "./pages/ExpenseHeatmap";
import BillReminders from "./pages/BillReminders";


// ---- Protected Route Wrapper ----
// Redirects to /login if not authenticated
const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Main content area — offset for sidebar on desktop */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
};

// ---- Public Route Wrapper ----
// Redirects to /dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// ---- Main App ----
const AppRoutes = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/expenses" element={<ExpenseHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/piggybank"  element={<PiggyBankPage />} />
          <Route path="/converter"  element={<CurrencyConverter />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="/heatmap"     element={<ExpenseHeatmap />} />
          <Route path="/bills"       element={<BillReminders />} />
          
          
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;