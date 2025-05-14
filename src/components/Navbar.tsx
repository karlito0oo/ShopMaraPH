import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        Sale is on! 25% off sitewide using SHOPMARAPH25 at checkout
      </div>
      
      {/* Main Navbar */}
      <nav className="border-b border-gray-200 relative">
        <div className="flex">
          {/* Logo */}
          <div className="bg-yellow-300 py-4 px-8">
            <Link to="/" className="font-bold text-lg text-black no-underline">
             ShopMara PH
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ml-auto flex items-center justify-center px-4 py-4 h-full transition-colors ${isMenuOpen ? 'bg-black text-yellow-300' : 'bg-yellow-300 text-black'}`}
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
            <Link to="/women" className="border-l border-gray-200 py-5 px-10 text-black no-underline hover:bg-gray-100">
              Women
            </Link>
            <Link to="/men" className="border-l border-gray-200 py-5 px-10 text-black no-underline hover:bg-gray-100">
              Men
            </Link>
            
            {/* Admin */}
            <Link to="/admin" className="border-l border-gray-200 py-5 px-5 text-black no-underline hover:bg-gray-100 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Admin</span>
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
            <Link to="/women" className="block py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              Women
            </Link>
            <Link to="/men" className="block py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              Men
            </Link>
            {/* Admin */}
            <Link to="/admin" className="flex items-center gap-2 py-3 px-4 border-b border-gray-200 text-black no-underline hover:bg-gray-100">
              <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Admin</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-2 py-3 px-4 text-black no-underline hover:bg-gray-100">
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
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 