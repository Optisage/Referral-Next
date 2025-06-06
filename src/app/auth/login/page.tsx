'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaExclamationCircle } from 'react-icons/fa';
import styles from './login.module.css';
import Preloader from '@/components/Preloader';
import SlideNotification from '@/components/SlideNotification';

export default function Login() {
  const { 
    user,
    loading: authLoading,
    sendOtp,
    verifyOtp,
    login
  } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  const otpRefs = Array(6).fill(null).map(() => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (!loading && user === null) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email);
      setOtpSent(true);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow backspace by checking for empty string or digits
    if (!/^$|^\d+$/.test(value)) return;
  
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  
    // Handle backspace
    if (!value && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
    // Handle forward focus
    else if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const otpValue = otp.join('');
      if (otpValue.length !== 6) throw new Error('Please enter all 6 digits');
      
      // Wait for verification to complete
      const result = await verifyOtp(email, otpValue);
      
      // Only show success if verification actually succeeded
      if (result) {
        setShowNotification(true);
        setTimeout(() => router.push('/dashboard'), 2500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setShowNotification(false); // Ensure success notification doesn't show
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      {(authLoading || loading) && (
        <Preloader fullScreen state={otpSent ? "auth_verify_otp" : "auth_send_otp"} />
      )}

      <SlideNotification
        show={showNotification}
        message="Login successful! Redirecting to dashboard..."
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
              className="w-16 h-16" 
            />
          </div>
        </div>
        <h2 className={styles.title}>
          {otpSent ? 'Enter OTP Code' : 'Sign in to optisage'}
        </h2>
        <p className={styles.subtitle}>
          {otpSent 
            ? `Verification code sent to ${email}`
            : 'Sign in to manage your referrals'}
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
                <label htmlFor="email" className={styles.formLabel}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[45px] w-full border border-gray-200 p-2 focus:outline-none rounded-lg"
                  placeholder="Enter your email"
                  required
                />
                <p className='mt-2 text-xs font-semibold text-slate-500'>
                  We'll send a verification code to this email address
                </p>
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
                  Don't have an account?{' '}
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
                      className={styles.otpInput}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
                <div className={styles.otpFooter}>
                  <p className={styles.otpHint}>
                    Didn't receive a code?{' '}
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className={styles.formLink}
                    >
                      Resend OTP
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