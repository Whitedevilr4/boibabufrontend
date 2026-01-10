import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../ui/NotificationBell';
import {
  HomeIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  BellIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  CogIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Books', href: '/admin/books', icon: BookOpenIcon },
    { name: 'Book Requests', href: '/admin/book-requests', icon: ClipboardDocumentListIcon },
    { name: 'Sellers', href: '/admin/sellers', icon: UsersIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Emails', href: '/admin/emails', icon: EnvelopeIcon },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TagIcon },
    { name: 'Complaints', href: '/admin/complaints', icon: ChatBubbleLeftRightIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'Pages', href: '/admin/pages', icon: DocumentTextIcon },
    { name: 'Website Settings', href: '/admin/website-settings', icon: CogIcon },
  ];

  const orderManagement = [
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  ];

  const financialManagement = [
    { name: 'Payments', href: '/admin/payments', icon: BanknotesIcon },
  ];

  const renderNavigationSection = (items, title, isMobile = false) => (
    <div className="space-y-2">
      {title && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            className={`flex items-center px-3 py-3 ${isMobile ? 'text-base' : 'text-sm'} font-medium rounded-lg transition-colors ${
              active
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className={`${isMobile ? 'mr-4 h-6 w-6' : 'mr-3 h-5 w-5'}`} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600 flex-shrink-0">
            <Link to="/admin" className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200 p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {renderNavigationSection(navigation, 'Main', true)}
            {renderNavigationSection(orderManagement, 'Order Management', true)}
            {renderNavigationSection(financialManagement, 'Financial', true)}
          </nav>

          {/* Mobile user menu */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Admin
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                View Store
              </Link>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:shadow-lg lg:flex lg:flex-col">
        {/* Desktop header */}
        <div className="flex items-center justify-between h-16 px-4 bg-primary-600 flex-shrink-0">
          <Link to="/admin" className="flex items-center space-x-2">
            <BookOpenIcon className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Admin</span>
          </Link>
          
          {/* Notification Bell */}
          <div className="text-white">
            <NotificationBell />
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {renderNavigationSection(navigation, 'Main')}
          {renderNavigationSection(orderManagement, 'Order Management')}
          {renderNavigationSection(financialManagement, 'Financial')}
        </nav>

        {/* Desktop user menu */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                Admin
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              View Store
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <Link to="/admin" className="flex items-center space-x-2">
            <BookOpenIcon className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </Link>

          <div className="flex items-center space-x-2">
            <NotificationBell />
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
