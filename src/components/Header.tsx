'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaUserCircle, FaCog, FaSignOutAlt, FaChartLine, FaHistory, FaWallet } from 'react-icons/fa';
import Preloader from '@/components/Preloader';

export default function Header() {
  const { user, logout, loggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't show header on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  if (isAuthPage) {
    return null;
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
  };
  
  // Navigation links - used for both desktop and mobile
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <FaChartLine className="mr-2" /> },
    { name: 'Transactions', href: '/transactions', icon: <FaHistory className="mr-2" /> },
    { name: 'Withdrawal', href: '/withdrawal', icon: <FaWallet className="mr-2" /> },
    { name: 'Settings', href: '/settings', icon: <FaCog className="mr-2" /> },
  ];

  // Handle optimized navigation
  const handleNavigation = (href: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Close menus
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    
    // Only navigate if not already on the page
    if (pathname !== href) {
      router.push(href);
    }
  };

  return (
    <>
      {loggingOut && <Preloader fullScreen state="auth_logout" />}
      <header className="text-white shadow-lg bg-whatsapp-dark-green">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard"
                prefetch={true}
                onClick={(e) => handleNavigation('/dashboard', e)} 
                className="flex items-center flex-shrink-0"
              >
                <Image 
                  src="/Optisage-Log0-white.svg" 
                  alt="optisage Logo" 
                  width={50} 
                  height={50}
                  priority
                  className="w-auto h-12 py-1" 
                />
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="items-center hidden space-x-1 md:flex">
              {user && navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === link.href 
                      ? 'bg-white/20 text-white shadow-inner' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={(e) => handleNavigation(link.href, e)}
                >
                  {link.icon} {link.name}
                </Link>
              ))}
            </nav>
            
            {/* Profile dropdown */}
            {user && (
              <div className="items-center hidden md:flex">
                <div className="relative ml-3">
                  <div>
                    <button
                      className="flex p-1 text-sm transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 bg-white/10 hover:bg-white/20"
                      onClick={toggleProfileMenu}
                    >
                      <FaUserCircle className="w-8 h-8" />
                    </button>
                  </div>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user.first_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link 
                        href="/settings" 
                        prefetch={true}
                        className="flex items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 group"
                        onClick={(e) => handleNavigation('/settings', e)}
                      >
                        <FaCog className="mr-2 text-gray-400 transition-colors group-hover:text-whatsapp-green" /> Settings
                      </Link>
                      <button
                        className="flex items-center block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 group"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="mr-2 text-gray-400 transition-colors group-hover:text-red-500" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 text-white rounded-md hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <FaTimes className="block w-6 h-6" />
                ) : (
                  <FaBars className="block w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute z-10 w-full shadow-lg md:hidden bg-whatsapp-dark-green">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile navigation links - show all options */}
              {user && navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={(e) => handleNavigation(link.href, e)}
                >
                  {link.icon} {link.name}
                </Link>
              ))}
            </div>
            
            {user && (
              <div className="pt-4 pb-3 border-t border-white/10">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <FaUserCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.first_name}</div>
                    <div className="text-sm font-medium text-white/70">{user.email}</div>
                  </div>
                </div>
                <div className="px-2 mt-3 space-y-1">
                  {/* Only show logout button here, Settings is already in the nav menu */}
                  <button
                    className="flex items-center block w-full px-3 py-2 text-base font-medium text-left text-white rounded-md hover:bg-white/10"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="mr-2" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
} 