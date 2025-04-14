'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';

export type NotificationType = 'success' | 'error' | 'info';

interface SlideNotificationProps {
  show: boolean;
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose: () => void;
}

export default function SlideNotification({
  show,
  message,
  type = 'success',
  duration = 5000,
  onClose
}: SlideNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete before calling onClose
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [show, duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete before calling onClose
  };
  
  // Early return if not showing
  if (!show) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <FaExclamationCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      case 'info':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-green-50 border-green-100';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-green-800';
    }
  };
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm overflow-hidden rounded-lg shadow-lg transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="alert"
    >
      <div className={`flex items-center p-4 border ${getBgColor()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className={`ml-2 mr-6 flex-1 ${getTextColor()}`}>
          {message}
        </div>
        <div className="flex-shrink-0 ml-auto">
          <button
            type="button"
            className={`-mx-1.5 -my-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg p-1 focus:ring-2 focus:ring-offset-2 ${getTextColor()} hover:bg-gray-100 focus:outline-none`}
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 