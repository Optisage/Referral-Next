'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './register.module.css';
import Preloader from '@/components/Preloader';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import { FaUser, FaEnvelope, FaPhone, FaHashtag } from 'react-icons/fa';
import { register, verifyOtp as apiVerifyOtp } from '@/services/api';
import SlideNotification from '@/components/SlideNotification';

export default function Register() {
  const { register: authRegister, sendOtp, verifyOtp: contextVerifyOtp, loggingOut } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234'); // Default to Nigeria
  const [whatsappChannelName, setWhatsappChannelName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  
  // References for the OTP input fields
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    if (userData && !showNotification) {
      router.push('/dashboard');
    }
  }, [userData, showNotification, router]);
  
  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
  };
  
  const handleWhatsappNumberChange = (newNumber: string) => {
    setWhatsappNumber(newNumber);
  };
  
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!fullName || !email || !whatsappChannelName) {
        throw new Error('All fields are required');
      }

      if (!whatsappNumber || whatsappNumber.trim() === '') {
        throw new Error('WhatsApp number is required');
      }

      // Handle special case for Canada's country code (replace +1CA with +1)
      let formattedCountryCode = countryCode;
      let userCountry = 'nigeria'; // Default country
      
      // Determine country based on country code
      if (countryCode === '+234') {
        userCountry = 'nigeria';
      } else if (countryCode === '+233') {
        userCountry = 'ghana';
      } else if (countryCode === '+1') {
        // Determine if Canada or USA based on which flag was selected
        const selectedCountry = localStorage.getItem('selectedCountry');
        userCountry = selectedCountry === 'CA' ? 'canada' : 'usa';
      } else if (countryCode === '+52') {
        userCountry = 'mexico';
      }

      // Combine country code with phone number - keep as is, don't standardize
      const cleanPhone = whatsappNumber.replace(/^\+/, '').replace(/\D/g, '');
      const fullWhatsappNumber = formattedCountryCode + cleanPhone;
      
      // Less restrictive validation - just check that there's something after the country code
      if (cleanPhone.length < 1) {
        throw new Error('Please enter a valid phone number');
      }

      console.log('Sending with phone number:', fullWhatsappNumber);

      const response = await register(
        email,
        fullName,
        fullWhatsappNumber,
        whatsappChannelName
      );

      if (response.status === 200) {
        setOtpSent(true);
        setStep(2);
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content is a valid 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input after paste
      if (otpRefs[5].current) {
        otpRefs[5].current!.focus();
      }
    }
  };
  
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const otpValue = otp.join('');
      if (otpValue.length !== 6) {
        throw new Error('Please enter a valid OTP');
      }

      if (!whatsappNumber || whatsappNumber.trim() === '') {
        throw new Error('WhatsApp number is required');
      }

      // Handle special case for Canada's country code (replace +1CA with +1)
      let formattedCountryCode = countryCode;
      let userCountry = 'nigeria'; // Default country
      
      // Determine country based on country code
      if (countryCode === '+234') {
        userCountry = 'nigeria';
      } else if (countryCode === '+233') {
        userCountry = 'ghana';
      } else if (countryCode === '+1') {
        // Determine if Canada or USA based on which flag was selected
        const selectedCountry = localStorage.getItem('selectedCountry');
        userCountry = selectedCountry === 'CA' ? 'canada' : 'usa';
      } else if (countryCode === '+52') {
        userCountry = 'mexico';
      }
      
      // Combine country code with phone number - keep as is, don't standardize
      const cleanPhone = whatsappNumber.replace(/^\+/, '').replace(/\D/g, '');
      const fullWhatsappNumber = formattedCountryCode + cleanPhone;
      
      // Less restrictive validation
      if (cleanPhone.length < 1) {
        throw new Error('Please enter a valid phone number');
      }

      console.log('Verifying with phone number:', fullWhatsappNumber);

      // Call the API directly to verify OTP
      const response = await apiVerifyOtp(fullWhatsappNumber, otpValue);

      if (response.status === 200) {
        // Store user data and token in local storage or auth context
        const { token, user } = response.data;
        
        // Add country to user data
        const userData = {
          ...user,
          country: userCountry
        };
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Call AuthContext register to ensure context is updated
        await authRegister({
          fullName: fullName,
          email: email || user.email,
          whatsappNumber: fullWhatsappNumber,
          whatsappChannelName: whatsappChannelName,
          country: userCountry
        });
        
        // Show success notification instead of modal
        setUserData(userData);
        setShowNotification(true);
        
        // Start redirect timer
        setTimeout(() => {
          router.push('/dashboard');
        }, 2500); // Give enough time for user to see notification
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setShowNotification(false);
    // Redirect to dashboard when notification is closed
    if (userData) {
      router.push('/dashboard');
    }
  };
  
  return (
    <div className={styles.container}>
      {/* Show preloader when loading */}
      {loading && <Preloader fullScreen state={step === 1 ? "auth_send_otp" : "auth_register"} />}
      
      {/* Success Notification */}
      <SlideNotification
        show={showNotification}
        message={userData ? `Welcome, ${userData.first_name}! Your account has been created successfully.` : "Registration successful!"}
        type="success"
        duration={2000}
        onClose={handleCloseNotification}
      />
      
      <div className={styles.logoContainer}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/Optisage-Log0-white.svg" 
            alt="optisage Logo" 
            width={64} 
            height={64}
            className="h-16 w-16" 
          />
        </div>
        <h2 className={styles.title}>
          {step === 1 ? 'Create your account' : 'Verify your account'}
        </h2>
        <p className={styles.subtitle}>
          {step === 1 
            ? 'Fill in your details to get started'
            : `We've sent a verification code to your WhatsApp number (${countryCode + whatsappNumber})`}
        </p>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          {error && (
            <div className={styles.errorAlert} role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {step === 1 ? (
            <form className={styles.form} onSubmit={handleSendOtp}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="whatsappNumber" className={styles.label}>
                  WhatsApp Number
                </label>
                <CountryCodeSelect
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  phone={whatsappNumber}
                  onPhoneChange={handleWhatsappNumberChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="whatsappChannelName" className={styles.label}>
                  WhatsApp Channel Name
                </label>
                <div className="mt-1">
                  <input
                    id="whatsappChannelName"
                    name="whatsappChannelName"
                    type="text"
                    required
                    value={whatsappChannelName}
                    onChange={(e) => setWhatsappChannelName(e.target.value)}
                    className={styles.inputField}
                    placeholder="Name of your WhatsApp group/channel"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? 'Processing...' : 'Send OTP'}
                </button>
              </div>
              
              <div className={styles.formFooter}>
                <p>
                  Already have an account?{' '}
                  <Link href="/auth/login" className={styles.link}>
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Verification Code
                </label>
                <div className={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={styles.otpInput}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? 'Processing...' : 'Verify & Register'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`${styles.button} bg-gray-200 text-gray-800 hover:bg-gray-300`}
                >
                  Go Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 