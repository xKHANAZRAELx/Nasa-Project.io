import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <nav className="bg-white bg-opacity-90 shadow-cosmic sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Brand/Logo */}
        <div className="flex-shrink-0">
          <NavLink to="/" className="text-2xl font-bold text-cosmic-blue">
            Cosmic Explorer
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-star-white hover:text-cosmic-blue transition-colors ${
                isActive ? 'border-b-2 border-cosmic-blue' : ''
              }`
            }
            aria-label="Astronomy Picture of the Day"
          >
            APOD
          </NavLink>
          <NavLink
            to="/mars-rover"
            className={({ isActive }) =>
              `text-star-white hover:text-cosmic-blue transition-colors ${
                isActive ? 'border-b-2 border-cosmic-blue' : ''
              }`
            }
            aria-label="Mars Rover"
          >
            Mars Rover
          </NavLink>
          <NavLink
            to="/neo-ws"
            className={({ isActive }) =>
              `text-star-white hover:text-cosmic-blue transition-colors ${
                isActive ? 'border-b-2 border-cosmic-blue' : ''
              }`
            }
            aria-label="Near Earth Objects"
          >
            NEO-WS
          </NavLink>
          <NavLink
            to="/epic"
            className={({ isActive }) =>
              `text-star-white hover:text-cosmic-blue transition-colors ${
                isActive ? 'border-b-2 border-cosmic-blue' : ''
              }`
            }
            aria-label="Earth Polychromatic Imaging Camera"
          >
            EPIC
          </NavLink>
          <NavLink
            to="/images"
            className={({ isActive }) =>
              `text-star-white hover:text-cosmic-blue transition-colors ${
                isActive ? 'border-b-2 border-cosmic-blue' : ''
              }`
            }
            aria-label="NASA Image and Video Library"
          >
            Images
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <button
            onClick={toggleMenu}
            className="text-star-white hover:text-cosmic-blue focus:outline-none"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-space-dark pb-4">
          <div className="flex flex-col space-y-4 px-4">
            <NavLink
              to="/"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium ${
                  isActive
                    ? 'text-cosmic-blue border-l-4 border-cosmic-blue pl-2'
                    : 'text-star-white hover:text-cosmic-blue'
                }`
              }
              aria-label="Astronomy Picture of the Day"
            >
              APOD
            </NavLink>
            <NavLink
              to="/mars-rover"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium ${
                  isActive
                    ? 'text-cosmic-blue border-l-4 border-cosmic-blue pl-2'
                    : 'text-star-white hover:text-cosmic-blue'
                }`
              }
              aria-label="Mars Rover"
            >
              Mars Rover
            </NavLink>
            <NavLink
              to="/neo-ws"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium ${
                  isActive
                    ? 'text-cosmic-blue border-l-4 border-cosmic-blue pl-2'
                    : 'text-star-white hover:text-cosmic-blue'
                }`
              }
              aria-label="Near Earth Objects"
            >
              NEO-WS
            </NavLink>
            <NavLink
              to="/epic"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium ${
                  isActive
                    ? 'text-cosmic-blue border-l-4 border-cosmic-blue pl-2'
                    : 'text-star-white hover:text-cosmic-blue'
                }`
              }
              aria-label="Earth Polychromatic Imaging Camera"
            >
              EPIC
            </NavLink>
            <NavLink
              to="/images"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium ${
                  isActive
                    ? 'text-cosmic-blue border-l-4 border-cosmic-blue pl-2'
                    : 'text-star-white hover:text-cosmic-blue'
                }`
              }
              aria-label="NASA Image and Video Library"
            >
              Images
            </NavLink>
          </div>
        </div>
      )}
    </div>
  </nav>
  );
};

export default Navbar