import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/header/Header'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import NotLoggedIn from './pages/NotLoggedIn';
import Pricing from './pages/Pricing';
import GmailStatus from './pages/GmailStatus';
import { useAuth } from './contexts/AuthContext';

const HeaderLayout = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
  <>
    <Header isLoggedIn={isAuthenticated} />
    <Outlet />
  </>
);

const PlainLayout = () => <Outlet />;

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
      <Routes>
        <Route element={<HeaderLayout isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Navigate to='/home' />} />
          <Route path="/home" element={<Home />}/>
          <Route path="/about" element={<About />}/>
          <Route path="/contact" element={<Contact />}/>
          <Route path="/pricing" element={<Pricing />}/>
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }/>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }/>
          <Route path="/gmail-status" element={
            <ProtectedRoute>
              <GmailStatus />
            </ProtectedRoute>
          }/>
        </Route>

        <Route element={<PlainLayout />}>
          <Route path="/register" element={<Register />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/not-logged-in" element={<NotLoggedIn />}/>
          <Route path="/not-found" element={<NotFound />}/>
          <Route path="*" element={<NotFound />}/>
        </Route>
      </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
