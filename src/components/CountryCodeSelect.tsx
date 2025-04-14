'use client';

import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// Simplified country data with name, code, and dial code
const COUNTRY_CODES = [
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' }
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (dialCode: string) => void;
  onPhoneChange: (phone: string) => void;
  phone: string;
  className?: string;
}

export default function CountryCodeSelect({
  value,
  onChange,
  onPhoneChange,
  phone,
  className = '',
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the current country from the value prop
  const currentCountry = COUNTRY_CODES.find(c => c.dialCode === value) || COUNTRY_CODES[0];

  // Initialize the selected country in localStorage if it doesn't exist
  React.useEffect(() => {
    if (currentCountry) {
      localStorage.setItem('selectedCountry', currentCountry.code);
    }
  }, [currentCountry]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    
    // Allow users to enter their phone number more naturally
    // Only remove country code prefix if present, but allow digits, spaces, and some special chars
    let cleanedPhone = newPhone;
    
    // Remove the country code if it's at the beginning of the input
    // For example, if country code is +234 and user types +2341234, only keep 1234
    if (cleanedPhone.startsWith(value)) {
      cleanedPhone = cleanedPhone.slice(value.length);
    }
    
    // Remove any remaining + (plus) signs if present
    cleanedPhone = cleanedPhone.replace(/\+/g, '');
    
    // Update the phone without the country code prefix
    onPhoneChange(cleanedPhone);
  };

  return (
    <div className="relative">
      <div className="flex w-full items-stretch">
        {/* Country code selector button */}
        <div className="relative inline-block text-left">
          <button
            type="button"
            className="inline-flex justify-center items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none h-[42px]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="mr-2">{currentCountry.flag}</span>
            <span>{currentCountry.dialCode}</span>
            <FaChevronDown className="ml-2 h-3 w-3" />
          </button>

          {/* Dropdown for country selection */}
          {isOpen && (
            <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
                {COUNTRY_CODES.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    className={`block px-4 py-2 text-sm w-full text-left ${country.dialCode === value ? 'bg-gray-100 font-bold' : 'text-gray-700'}`}
                    role="menuitem"
                    onClick={() => {
                      onChange(country.dialCode);
                      setIsOpen(false);
                      // Store the country code in localStorage to differentiate between countries with same dial code
                      localStorage.setItem('selectedCountry', country.code);
                    }}
                  >
                    <span className="mr-2">{country.flag}</span>
                    <span className="mr-2">{country.name}</span>
                    <span className="text-gray-500">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Phone input */}
        <input
          type="tel"
          className={`block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-[42px] ${className}`}
          placeholder="Phone number"
          value={phone}
          onChange={handlePhoneChange}
        />
      </div>
    </div>
  );
} 