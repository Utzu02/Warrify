
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../contexts/AuthContext';
import pozalogo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
      <div className="leftSide">
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
        <ul className="textSectiuni primary-nav">
          <li>
            <Link to="/home" className={`listSectiuni ${location === '/home' && 'active'}`}>Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className={`listSectiuni ${location === '/dashboard' && 'active'}`}>Dashboard</Link>
          </li>
          <li>
            <Link to="/pricing" className={`listSectiuni ${location === '/pricing' && 'active'}`}>Pricing</Link>
          </li>
          <li>
            <Link to="/about" className={`listSectiuni ${location === '/about' && 'active'}`}>About Us</Link>
          </li>
          <li>
            <Link to="/contact" className={`listSectiuni ${location === '/contact' && 'active'}`}>Contact</Link>
          </li>
        </ul>
      </div>
      <div className="rightSide">
        <ul className="textSectiuni secondary-nav">
          <li className='mobileShow'>
            <Link to="/home" className={`listSectiuni ${location === '/home' && 'active'}`}>Home</Link>
          </li>
          <li className='mobileShow'>
            <Link to="/dashboard" className={`listSectiuni ${location === '/dashboard' && 'active'}`}>Dashboard</Link>
          </li>
          <li className='mobileShow'>
            <Link to="/pricing" className={`listSectiuni ${location === '/pricing' && 'active'}`}>Pricing</Link>
          </li>
          <li className='mobileShow'>
            <Link to="/about" className={`listSectiuni ${location === '/about' && 'active'}`}>About Us</Link>
          </li>
          <li className='mobileShow'>
            <Link to="/contact" className={`listSectiuni ${location === '/contact' && 'active'}`}>Contact</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li>
                <button onClick={logOut} className="button buttoninvert">
                  Logout
                </button>
              </li>
              <li>
                <Link to="/profile" className="button">
                  Profile
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="button">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="button">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
