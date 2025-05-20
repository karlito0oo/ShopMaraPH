import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsAccountDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
      Welcome, Fairies! Score Exclusive Launch Savings with Code: SHOPMARANEW
      </div>
      
      {/* Main Navbar */}
      <nav className="border-b border-gray-200 relative">
        <div className="flex">
          {/* Logo */}
          <div className="bg-[#ad688f] py-4 px-8">
            <Link to="/" className="font-bold text-lg text-white no-underline">
             ShopMara PH
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ml-auto flex items-center justify-center px-4 py-4 h-full transition-colors ${isMenuOpen ? 'bg-black text-[#ad688f]' : 'bg-[#ad688f] text-black'}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ml-auto">
            <Link to="/products" className="border-l border-gray-200 py-5 px-10 text-black no-underline hover:bg-gray-100">
              All Products
            </Link>
            <Link to="/new" className="border-l border-gray-200 py-5 px-10 text-black no-underline hover:bg-gray-100">
              New
            </Link>
            <Link to="/about" className="border-l border-gray-200 py-5 px-10 text-black no-underline hover:bg-gray-100">
              About Us
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="border-l border-gray-200 py-5 px-5 text-black no-underline hover:bg-gray-100 flex items-center justify-center relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {/* My Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleAccountDropdown}
                className="border-l border-gray-200 py-5 px-5 text-black hover:bg-gray-100 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">My Account</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isAccountDropdownOpen && (
                <div className="absolute right-0 z-10 mt-0 bg-white shadow-lg border border-gray-200 rounded-b w-48">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-black no-underline hover:bg-gray-100 border-b border-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">Admin</span>
                        </Link>
                      )}
                      <Link to="/my-orders" className="flex items-center gap-2 px-4 py-3 text-black no-underline hover:bg-gray-100 border-b border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">My Orders</span>
                      </Link>
                      <div className="flex items-center gap-2 px-4 py-3 text-black hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Logout</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex items-center gap-2 px-4 py-3 text-black no-underline hover:bg-gray-100 border-b border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Login</span>
                      </Link>
                      <Link to="/register" className="flex items-center gap-2 px-4 py-3 text-black no-underline hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                        <span className="text-sm">Sign Up</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden w-full bg-white border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-2">
            <Link to="/products" className="block py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              All Products
            </Link>
            <Link to="/new" className="block py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              New
            </Link>
            <Link to="/about" className="block py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              About Us
            </Link>
            
            <Link to="/cart" className="flex items-center gap-2 py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Cart</span>
              {getTotalItems() > 0 && (
                <span className="bg-red-500 text-white rounded-full text-xs px-2 py-1">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {/* Account Options */}
            <div className="border-b border-gray-200 py-2 px-4">
              <div className="font-medium text-sm mb-2">My Account</div>
              
              {isAuthenticated ? (
                <div className="ml-2 space-y-2">
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 py-2 text-black no-underline hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Admin</span>
                    </Link>
                  )}
                  
                  <Link to="/my-orders" className="flex items-center gap-2 py-2 text-black no-underline hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">My Orders</span>
                  </Link>
                  
                  <div className="flex items-center gap-2 py-2 text-black hover:text-gray-600 cursor-pointer" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Logout {user && `(${user.name})`}</span>
                  </div>
                </div>
              ) : (
                <div className="ml-2 space-y-2">
                  <Link to="/login" className="flex items-center gap-2 py-2 text-black no-underline hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Login</span>
                  </Link>
                  
                  <Link to="/register" className="flex items-center gap-2 py-2 text-black no-underline hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    <span className="text-sm">Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 