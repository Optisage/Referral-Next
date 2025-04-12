'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  message,
  title = 'Success!',
  autoClose = true,
  autoCloseTime = 3000
}: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow animation to complete
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseTime, onClose]);

  if (!isOpen) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div 
        className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-8'
        }`}
      >
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" 
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FaCheckCircle className="h-10 w-10 text-green-500" />
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-500">
            {message}
          </p>
          
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 