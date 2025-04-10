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

export default function Login() {
  const { login, sendOtp, verifyOtp, logout, loggingOut } = useAuth();
  const router = useRouter();
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234'); // Default to Nigeria
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // References for the OTP input fields
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!whatsappNumber) {
      setError('WhatsApp number is required');
      return;
    }
    
    try {
      setLoading(true);
      // For demo purposes, we'll simulate sending OTP to the phone number
      // In a real app, this would call an API to send the OTP to the WhatsApp number
      await sendOtp(whatsappNumber);
      setOtpSent(true);
      // Focus the first OTP input when OTP is sent
      setTimeout(() => {
        if (otpRefs[0].current) {
          otpRefs[0].current!.focus();
        }
      }, 100);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error(err);
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
    
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    
    const fullWhatsappNumber = whatsappNumber.startsWith(countryCode) 
      ? whatsappNumber 
      : countryCode + whatsappNumber.replace(/^\+/, '');
    
    try {
      setLoading(true);
      // For demo purposes, we'll use the existing verifyOtp function
      // In a real app, this would verify the OTP sent to the WhatsApp number
      const isValid = await verifyOtp(fullWhatsappNumber, otpValue);
      
      if (isValid) {
        // Generate a mock email for the login function since we're not collecting email
        const mockEmail = `user_${Math.floor(Math.random() * 10000)}@example.com`;
        await login(mockEmail, otpValue, fullWhatsappNumber);
        router.push('/dashboard');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      {/* Show preloader when loading */}
      {loading && <Preloader fullScreen state={otpSent ? "auth_verify_otp" : "auth_send_otp"} />}
      
      <div className={styles.formContainer}>
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/Optisage-Log0-white.svg" 
              alt="OptSage Logo" 
              width={64} 
              height={64}
              className="h-16 w-16" 
            />
          </div>
        </div>
        <h2 className={styles.title}>
          {otpSent ? 'Enter OTP Code' : 'Sign in to OptSage'}
        </h2>
        <p className={styles.subtitle}>
          {otpSent 
            ? `We've sent a verification code to ${whatsappNumber}`
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
                <div className="mt-1">
                  <CountryCodeSelect
                    value={countryCode}
                    onChange={setCountryCode}
                    phone={whatsappNumber}
                    onPhoneChange={setWhatsappNumber}
                    className={styles.formInput}
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
                    'Verify OTP'
                  )}
                </button>
              </div>
              
              <div className={styles.formFooter}>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className={styles.backButton}
                >
                  Go back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}