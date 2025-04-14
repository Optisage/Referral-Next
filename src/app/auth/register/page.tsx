'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './register.module.css';
import Preloader from '@/components/Preloader';
import CountryCodeSelect from '@/components/CountryCodeSelect';

export default function Register() {
  const { register, sendOtp, verifyOtp, loggingOut } = useAuth();
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
    
    if (!fullName || !email || !whatsappNumber || !whatsappChannelName) {
      setError('All fields are required');
      return;
    }
    
    try {
      setLoading(true);
      // Send OTP to either email or whatsapp number
      await sendOtp(whatsappNumber);
      setStep(2);
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
      const isValid = await verifyOtp(fullWhatsappNumber, otpValue);
      
      if (isValid) {
        await register({
          name: fullName,
          email,
          phone: fullWhatsappNumber,
          group_name:whatsappChannelName,
        });
        router.push('/dashboard');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      {/* Show preloader when loading */}
      {loading && <Preloader fullScreen state={step === 1 ? "auth_send_otp" : "auth_register"} />}
      
      <div className={styles.logoContainer}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/Optisage-Log0-white.svg" 
            alt="OptSage Logo" 
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
            : `We've sent a verification code to ${email}`}
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
                <div className="mt-1 phone-input-container">
                  <CountryCodeSelect
                    value={countryCode}
                    onChange={setCountryCode}
                    phone={whatsappNumber}
                    onPhoneChange={setWhatsappNumber}
                    className=""
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Please provide your country code and WhatsApp number
                  </p>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="whatsappChannelName" className={styles.label}>
                  WhatsApp Channel/Group Name
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
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? 'Processing...' : 'Continue'}
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
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? 'Processing...' : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 