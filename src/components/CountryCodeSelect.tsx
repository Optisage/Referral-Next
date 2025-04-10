'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaGlobe, FaSearch } from 'react-icons/fa';

// Expanded country data with name, code, and dial code
const COUNTRY_CODES = [
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'UAE', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼' },
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
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [displayValue, setDisplayValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize the selected country based on the provided value (dial code)
  useEffect(() => {
    const country = COUNTRY_CODES.find(country => country.dialCode === value);
    if (country) {
      setSelectedCountry(country);
    }
  }, [value]);

  // Format phone number with country code
  useEffect(() => {
    // If the phone starts with the dial code, don't add it again
    if (phone.startsWith(selectedCountry.dialCode)) {
      setDisplayValue(phone);
    } else {
      // Remove any + or dial code if it exists before combining
      const cleanPhone = phone.replace(/^\+|^[0-9]{1,3}/, '');
      setDisplayValue(`${selectedCountry.dialCode}${cleanPhone}`);
    }
  }, [selectedCountry, phone]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    onChange(country.dialCode);
    setIsOpen(false);
    setSearchTerm('');
    
    // Update the phone number with the new country code
    const phoneWithoutCode = phone.replace(/^\+[0-9]{1,3}/, '');
    onPhoneChange(`${country.dialCode}${phoneWithoutCode}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    onPhoneChange(newPhone);
  };

  // Filter countries based on search term
  const filteredCountries = searchTerm 
    ? COUNTRY_CODES.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        country.dialCode.includes(searchTerm))
    : COUNTRY_CODES;

  return (
    <div className="relative">
      <div className="flex w-full items-stretch">
        <button
          ref={buttonRef}
          type="button"
          className="flex items-center justify-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
          onClick={() => setIsOpen(!isOpen)}
          style={{ height: '42px', minWidth: '80px' }}
        >
          <span className="mr-1 text-base">{selectedCountry.flag}</span>
          <span className="hidden sm:inline text-sm">{selectedCountry.dialCode}</span>
          <FaChevronDown className="ml-1 h-3 w-3" />
        </button>
        
        <input
          ref={inputRef}
          type="tel"
          className={`flex-1 block w-full px-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-whatsapp-green focus:border-whatsapp-green ${className}`}
          placeholder="Phone number"
          value={phone}
          onChange={handlePhoneChange}
          style={{ height: '42px' }}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 mt-1 w-72 bg-white rounded-md shadow-lg max-h-72 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b z-10">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-whatsapp-green focus:border-whatsapp-green text-sm"
                placeholder="Search country or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <ul className="py-1">
            {filteredCountries.map((country) => (
              <li 
                key={country.code}
                className="px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCountrySelect(country)}
              >
                <span className="mr-2 text-lg">{country.flag}</span>
                <span className="mr-2">{country.name}</span>
                <span className="text-gray-500 ml-auto">{country.dialCode}</span>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-gray-500 text-center">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 