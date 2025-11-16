
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../contexts/AuthContext';
import pozalogo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../button';

interface HeaderProps {
  isLoggedIn?: boolean;
}

const Header = ({ isLoggedIn }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation().pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const logOut = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Close menu when scrolling
      if (menuOpen) {
        setMenuOpen(false);
      }

      // Don't do anything if we haven't scrolled more than 500px
      if (currentScrollY < 500) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Scrolling down - hide header
          if (currentScrollY > lastScrollY && currentScrollY > 500) {
            setIsHeaderVisible(false);
          } 
          // Scrolling up - show header
          else if (currentScrollY < lastScrollY) {
            setIsHeaderVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, menuOpen]);

  return (
    <header className={`header ${menuOpen ? 'header--open' : ''} ${!isHeaderVisible ? 'header--hidden' : ''}`}>
      <div className="site-header-left">
        <div className="hamburger-header">
          <Link to="/home" className="logo-link">
            <img src={pozalogo} alt="Warrify logo" />
          </Link>
          <button type="button" className={`hamburger ${menuOpen ? 'is-active' : ''}`} onClick={toggleMenu} aria-label="Toggle navigation">
            <span />
            <span />
            <span />
          </button>
        </div>
        <ul className="site-header-nav-list primary-nav">
          <li>
            <Link to="/home" className={`site-header-nav-link ${location === '/home' && 'active'}`}>Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className={`site-header-nav-link ${location === '/dashboard' && 'active'}`}>Dashboard</Link>
          </li>
          <li>
            <Link to="/pricing" className={`site-header-nav-link ${location === '/pricing' && 'active'}`}>Pricing</Link>
          </li>
          <li>
            <Link to="/about" className={`site-header-nav-link ${location === '/about' && 'active'}`}>About Us</Link>
          </li>
          <li>
            <Link to="/contact" className={`site-header-nav-link ${location === '/contact' && 'active'}`}>Contact</Link>
          </li>
        </ul>
      </div>
      <div className="site-header-right">
        <ul className="site-header-nav-list secondary-nav">
          <li className='site-header-mobile-item'>
            <Link to="/home" className={`site-header-nav-link ${location === '/home' && 'active'}`}>Home</Link>
          </li>
          <li className='site-header-mobile-item'>
            <Link to="/dashboard" className={`site-header-nav-link ${location === '/dashboard' && 'active'}`}>Dashboard</Link>
          </li>
          <li className='site-header-mobile-item'>
            <Link to="/pricing" className={`site-header-nav-link ${location === '/pricing' && 'active'}`}>Pricing</Link>
          </li>
          <li className='site-header-mobile-item'>
            <Link to="/about" className={`site-header-nav-link ${location === '/about' && 'active'}`}>About Us</Link>
          </li>
          <li className='site-header-mobile-item'>
            <Link to="/contact" className={`site-header-nav-link ${location === '/contact' && 'active'}`}>Contact</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li>
                <Button variant="secondary" onClick={logOut}>
                  Logout
                </Button>
              </li>
              <li>
                <Button to="/profile" variant="primary">
                  Profile
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Button to="/login" variant="primary">
                  Login
                </Button>
              </li>
              <li>
                <Button to="/register" variant="secondary">
                  Register
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
