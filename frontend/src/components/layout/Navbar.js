import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { 
  BookOpenIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import NotificationBell from '../ui/NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabletUserMenuOpen, setIsTabletUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const tabletMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close tablet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tabletMenuRef.current && !tabletMenuRef.current.contains(event.target)) {
        setIsTabletUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch website settings for logo and name
  const { data: websiteSettings } = useQuery(
    'websiteSettings',
    () => {
      return api.get(`/api/admin/website-settings/public`).then(res => res.data);
    },
    { 
      staleTime: 30 * 60 * 1000, // Cache for 30 minutes
      retry: 1
    }
  );

  // Helper function to construct image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://boibabu.vercel.app${imagePath}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    try {
      logout();
      setIsMenuOpen(false);
      setIsTabletUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      setIsMenuOpen(false);
      setIsTabletUserMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            {websiteSettings?.logo ? (
              <img
                src={getImageUrl(websiteSettings.logo)}
                alt={websiteSettings.websiteName || 'BoiBabu'}
                className="h-8 sm:h-10 lg:h-12 w-auto max-w-[100px] sm:max-w-[120px] lg:max-w-[140px] object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <BookOpenIcon 
              className="h-8 w-8 text-primary-600" 
              style={{ display: websiteSettings?.logo ? 'none' : 'block' }}
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {websiteSettings?.websiteName || 'BoiBabu'}
            </span>
          </Link>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-lg mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for books, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/books" className="text-sm xl:text-base text-gray-700 hover:text-primary-600 transition-colors">
              Books
            </Link>
            
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <HeartIcon className="h-5 w-5 xl:h-6 xl:w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 xl:h-5 xl:w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCartIcon className="h-5 w-5 xl:h-6 xl:w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 xl:h-5 xl:w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <UserIcon className="h-5 w-5 xl:h-6 xl:w-6" />
                  <span className="hidden xl:block text-sm">{user?.name}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Wishlist
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/complaints"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Support & Complaints
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Panel
                      </Link>
                    )}
                    {user?.role === 'seller' && (
                      <Link
                        to="/seller"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Seller Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 xl:space-x-4">
                <Link
                  to="/login"
                  className="text-sm xl:text-base text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-3 py-2 xl:px-4 xl:py-2 text-sm xl:text-base rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Tablet Navigation (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-3">
            {/* Books Link */}
            <Link to="/books" className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
              Books
            </Link>
            
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <HeartIcon className="h-6 w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* User Menu Button */}
            <div className="relative" ref={tabletMenuRef}>
              <button
                onClick={() => setIsTabletUserMenuOpen(!isTabletUserMenuOpen)}
                className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <UserIcon className="h-6 w-6" />
              </button>

              {/* Tablet User Dropdown */}
              {isTabletUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  {isAuthenticated ? (
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                        {user?.name}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTabletUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTabletUserMenuOpen(false)}
                      >
                        My Wishlist
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTabletUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/complaints"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTabletUserMenuOpen(false)}
                      >
                        Support & Complaints
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsTabletUserMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      {user?.role === 'seller' && (
                        <Link
                          to="/seller"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsTabletUserMenuOpen(false)}
                        >
                          Seller Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="py-1">
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsTabletUserMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 text-center"
                        onClick={() => setIsTabletUserMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for books, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            <div className="space-y-1">
              <Link
                to="/books"
                className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Books
              </Link>
              
              <Link
                to="/wishlist"
                className="flex items-center py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <HeartIcon className="h-5 w-5 mr-3" />
                Wishlist ({wishlistItems.length})
              </Link>
              
              <Link
                to="/cart"
                className="flex items-center py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-3" />
                Cart ({itemCount})
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/complaints"
                    className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Support & Complaints
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user?.role === 'seller' && (
                    <Link
                      to="/seller"
                      className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Seller Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-3 px-2 text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block py-3 px-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-3 px-2 text-base bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
