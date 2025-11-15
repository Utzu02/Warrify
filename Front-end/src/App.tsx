import { Navigate, useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header/Header'
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

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/register', '/not-logged-in'];
  const shouldRenderHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {shouldRenderHeader && <Header isLoggedIn={isAuthenticated}/>}
      <Routes>
        <Route path="/" element={<Navigate to='/home' />} />
        <Route path="/home" element={<Home />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/about" element={<About />}/>
        <Route path="/contact" element={<Contact />}/>
        <Route path="/pricing" element={<Pricing />}/>
        <Route path="/not-logged-in" element={<NotLoggedIn />}/>
        <Route path="/not-found" element={<NotFound />}/>
        
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
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
