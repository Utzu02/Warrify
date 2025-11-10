
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import Cookies from 'js-cookie';
import pozalogo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface HeaderProps {
  isLoggedIn?: boolean;
}

const Header = ({ isLoggedIn }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const logOut = () => {
    Cookies.remove('UID');
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className={`header ${menuOpen ? 'header--open' : ''}`}>
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
                <Link to="/register" className="button buttoninvert">
                  Try for free
                </Link>
              </li>
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
