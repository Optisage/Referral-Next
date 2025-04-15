'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getCountryFromPhoneNumber } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './register.module.css';
import Preloader from '@/components/Preloader';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import SlideNotification from '@/components/SlideNotification';

export default function Register() {
  const { 
    user,
    loading: authLoading,
    register,
    verifyOtp,
    setPageLoading
  } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [whatsappChannelName, setWhatsappChannelName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const otpRefs = Array(6).fill(null).map(() => useRef<HTMLInputElement>(null));
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);

    try {
      const fullWhatsappNumber = `${countryCode}${whatsappNumber.replace(/\D/g, '')}`;
      const country = getCountryFromPhoneNumber(fullWhatsappNumber);

      await register({
        name:fullName,
        email,
        phone: fullWhatsappNumber,
        group_name: whatsappChannelName,
        country
      });

      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);

    try {
      const fullWhatsappNumber = `${countryCode}${whatsappNumber.replace(/\D/g, '')}`;
      const otpValue = otp.join('');

      if (otpValue.length !== 6) {
        throw new Error('Please enter a valid OTP');
      }

      const verified = await verifyOtp(fullWhatsappNumber, otpValue);
      if (!verified) throw new Error('OTP verification failed');

      setShowNotification(true);
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      {(authLoading || localLoading) && (
        <Preloader fullScreen state={step === 1 ? "auth_send_otp" : "auth_register"} />
      )}

      <SlideNotification
        show={showNotification}
        message="Registration successful! Redirecting to dashboard..."
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
            className="w-16 h-16" 
          />
        </div>
        <h2 className={styles.title}>
          {step === 1 ? 'Create your account' : 'Verify your account'}
        </h2>
        <p className={styles.subtitle}>
          {step === 1 
            ? 'Fill in your details to get started'
            : `Verification code sent to ${countryCode}${whatsappNumber}`}
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
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
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
              
              <div className={styles.formGroup}>
                <label htmlFor="whatsappNumber" className={styles.label}>
                  WhatsApp Number
                </label>
                <CountryCodeSelect
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  phone={whatsappNumber}
                  onPhoneChange={setWhatsappNumber}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="whatsappChannelName" className={styles.label}>
                  WhatsApp Channel Name
                </label>
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
              
              <button
                type="submit"
                disabled={localLoading}
                className={styles.button}
              >
                {localLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              
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
                      className={styles.otpInput}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={localLoading}
                  className={styles.button}
                >
                  {localLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={styles.secondaryButton}
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