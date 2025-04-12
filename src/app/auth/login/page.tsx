'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaPhone, FaExclamationCircle } from 'react-icons/fa';
import styles from './login.module.css';
import Preloader from '@/components/Preloader';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import SlideNotification from '@/components/SlideNotification';
import { loginWithOtp, verifyOtp } from '@/services/api';

export default function Login() {
  const { login, loggingOut } = useAuth();
  const router = useRouter();
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234'); // Default to Nigeria
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  
  // References for the OTP input fields
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Effect to redirect after notification is closed
  useEffect(() => {
    if (userData && !showNotification) {
      // Redirect to dashboard after notification is closed or expires
      router.push('/dashboard');
    }
  }, [userData, showNotification, router]);
  
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!whatsappNumber || whatsappNumber.trim() === '') {
        throw new Error('WhatsApp number is required');
      }

      // Format the phone number properly - only keep digits
      let phoneDigits = whatsappNumber.replace(/\D/g, '');
      
      // Remove leading zeros that might come from user input
      phoneDigits = phoneDigits.replace(/^0+/, '');
      
      // Format country code - remove any + and non-digits
      const countryDigits = countryCode.replace(/\D/g, '');
      
      // Combine with + at the beginning
      const fullWhatsappNumber = `+${countryDigits}${phoneDigits}`;
      
      // Validate that we have enough digits for a phone number
      if (phoneDigits.length < 3) {
        throw new Error('Please enter a valid phone number');
      }

      console.log('Sending login OTP to:', fullWhatsappNumber);
      
      setLoading(true);
      
      // Call the API to send OTP
      const response = await loginWithOtp(fullWhatsappNumber);
      
      if (response.status === 200) {
        setOtpSent(true);
        // Focus the first OTP input when OTP is sent
        setTimeout(() => {
          if (otpRefs[0].current) {
            otpRefs[0].current!.focus();
          }
        }, 100);
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
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the OTP state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to the next input if a digit was entered
    if (value && index < 5 && otpRefs[index + 1].current) {
      otpRefs[index + 1].current!.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to the previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpRefs[index - 1].current) {
      otpRefs[index - 1].current!.focus();
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
    
    try {
      const otpValue = otp.join('');
      
      if (otpValue.length !== 6) {
        throw new Error('Please enter all 6 digits of the OTP');
      }
      
      if (!whatsappNumber || whatsappNumber.trim() === '') {
        throw new Error('WhatsApp number is required');
      }
      
      // Format the phone number properly - only keep digits
      let phoneDigits = whatsappNumber.replace(/\D/g, '');
      
      // Remove leading zeros that might come from user input
      phoneDigits = phoneDigits.replace(/^0+/, '');
      
      // Format country code - remove any + and non-digits
      const countryDigits = countryCode.replace(/\D/g, '');
      
      // Combine with + at the beginning
      const fullWhatsappNumber = `+${countryDigits}${phoneDigits}`;
      
      // Validate that we have enough digits for a phone number
      if (phoneDigits.length < 3) {
        throw new Error('Please enter a valid phone number');
      }
      
      console.log('Verifying OTP with phone:', fullWhatsappNumber, 'OTP:', otpValue);
      
      setLoading(true);
      
      // Call the API to verify OTP
      const response = await verifyOtp(fullWhatsappNumber, otpValue);
      
      if (response.status === 200) {
        // Store user data and token in local storage
        const { token, user } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Important: Call login from AuthContext to ensure user state is updated
        await login(user.email || "", otpValue, fullWhatsappNumber);
        
        // Update state for success notification
        setUserData(user);
        setShowNotification(true);
        
        // Start redirect timer
        setTimeout(() => {
          router.push('/dashboard');
        }, 2500); // Give enough time for user to see notification
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
      {loading && <Preloader fullScreen state={otpSent ? "auth_verify_otp" : "auth_send_otp"} />}
      
      {/* Success Notification */}
      <SlideNotification
        show={showNotification}
        message={userData ? `Welcome back, ${userData.first_name}! Login successful.` : "Login successful."}
        type="success"
        duration={2000}
        onClose={handleCloseNotification}
      />
      
      <div className={styles.formContainer}>
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
        </div>
        <h2 className={styles.title}>
          {otpSent ? 'Enter OTP Code' : 'Sign in to optisage'}
        </h2>
        <p className={styles.subtitle}>
          {otpSent 
            ? `We've sent a verification code to your WhatsApp number (${countryCode + whatsappNumber})`
            : 'Enter your WhatsApp number to receive a one-time password'}
        </p>

        <div className={styles.formCard}>
          {error && (
            <div className={styles.errorMessage} role="alert">
              <FaExclamationCircle className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}
          
          {!otpSent ? (
            <form className={styles.form} onSubmit={handleSendOtp}>
              <div className={styles.formGroup}>
                <label htmlFor="whatsappNumber" className={styles.formLabel}>
                  WhatsApp Number
                </label>
                <div className="mt-1 phone-input-container">
                  <CountryCodeSelect
                    value={countryCode}
                    onChange={setCountryCode}
                    phone={whatsappNumber}
                    onPhoneChange={setWhatsappNumber}
                    className=""
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send a verification code to this WhatsApp number
                  </p>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : styles.submitButtonEnabled}`}
                >
                  {loading ? (
                    <>
                      <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
              
              <div className={styles.formFooter}>
                <p>
                  Don't have an account yet?{' '}
                  <Link href="/auth/register" className={styles.formLink}>
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
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
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Didn't receive a code?{' '}
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className={styles.formLink}
                    >
                      Go back and try again
                    </button>
                  </p>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.submitButton} ${loading ? styles.submitButtonDisabled : styles.submitButtonEnabled}`}
                >
                  {loading ? (
                    <>
                      <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}