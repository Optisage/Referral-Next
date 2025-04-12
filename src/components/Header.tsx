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
      <header className="bg-whatsapp-dark-green text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard"
                prefetch={true}
                onClick={(e) => handleNavigation('/dashboard', e)} 
                className="flex-shrink-0 flex items-center"
              >
                <Image 
                  src="/Optisage-Log0-white.svg" 
                  alt="optisage Logo" 
                  width={50} 
                  height={50}
                  priority
                  className="h-12 w-auto py-1" 
                />
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-1 items-center">
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
              <div className="hidden md:flex items-center">
                <div className="ml-3 relative">
                  <div>
                    <button
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 bg-white/10 p-1 hover:bg-white/20 transition-colors"
                      onClick={toggleProfileMenu}
                    >
                      <FaUserCircle className="h-8 w-8" />
                    </button>
                  </div>
                  
                  {profileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 backdrop-blur-sm z-10">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-gray-500 truncate text-xs">{user.email}</p>
                      </div>
                      <Link 
                        href="/settings" 
                        prefetch={true}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center group"
                        onClick={(e) => handleNavigation('/settings', e)}
                      >
                        <FaCog className="mr-2 text-gray-400 group-hover:text-whatsapp-green transition-colors" /> Settings
                      </Link>
                      <button
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center group"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="mr-2 text-gray-400 group-hover:text-red-500 transition-colors" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute w-full bg-whatsapp-dark-green shadow-lg z-10">
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
                    <FaUserCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.fullName}</div>
                    <div className="text-sm font-medium text-white/70">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  {/* Only show logout button here, Settings is already in the nav menu */}
                  <button
                    className="w-full text-left flex items-center block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10"
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