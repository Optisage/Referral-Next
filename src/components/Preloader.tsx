'use client';

import React from 'react';
import { FaCircleNotch } from 'react-icons/fa';

// Define common loading states and their messages
export type LoadingState = 
  | 'default'
  | 'auth_login'
  | 'auth_register'
  | 'auth_logout'
  | 'auth_verify_otp'
  | 'auth_send_otp'
  | 'dashboard'
  | 'settings'
  | 'settings_save'
  | 'transactions'
  | 'withdrawal'
  | 'withdrawal_process'
  | 'custom';

// Mapping of loading states to appropriate messages
const stateMessages: Record<Exclude<LoadingState, 'custom'>, string> = {
  default: 'Loading...',
  auth_login: 'Signing in...',
  auth_register: 'Creating your account...',
  auth_logout: 'Signing out...',
  auth_verify_otp: 'Verifying OTP...',
  auth_send_otp: 'Sending verification code...',
  dashboard: 'Loading dashboard...',
  settings: 'Loading settings...',
  settings_save: 'Saving your changes...',
  transactions: 'Loading transactions...',
  withdrawal: 'Loading withdrawal page...',
  withdrawal_process: 'Processing withdrawal...'
};

interface PreloaderProps {
  fullScreen?: boolean;
  text?: string;
  state?: LoadingState;
  size?: 'small' | 'medium' | 'large';
}

const Preloader: React.FC<PreloaderProps> = ({ 
  fullScreen = false, 
  text, 
  state = 'default',
  size = 'medium' 
}) => {
  // Determine spinner size
  let spinnerSize: string;
  switch (size) {
    case 'small':
      spinnerSize = 'w-5 h-5';
      break;
    case 'large':
      spinnerSize = 'w-12 h-12';
      break;
    default:
      spinnerSize = 'w-8 h-8';
  }

  // Determine the display message (custom text overrides state message)
  const displayText = text || (state !== 'custom' ? stateMessages[state] : 'Loading...');

  const preloaderContent = (
    <div className="flex flex-col items-center justify-center">
      <FaCircleNotch className={`${spinnerSize} text-whatsapp-dark-green animate-spin`} />
      {displayText && <p className="mt-2 text-gray-600 font-medium">{displayText}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {preloaderContent}
      </div>
    );
  }

  return preloaderContent;
};

export default Preloader; 