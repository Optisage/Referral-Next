'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaBell, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import styles from './settings.module.css';
import Preloader from '@/components/Preloader';

export default function Settings() {
  const router = useRouter();
  const { user, loading, saveSettings, fetchSettings  } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  // Add new state for initial loading
const [initialLoading, setInitialLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('profile');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
   
  // Profile form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappChannelName, setWhatsappChannelName] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  
  // Set initial form values when user data is loaded
  useEffect(() => {
    if (user) {
      setFullName(`${user.first_name} ${user.last_name}`.trim());
      setEmail(user.email);
      setWhatsappNumber(user.phone);
      setWhatsappChannelName(user.group_name);
    }
  }, [user]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchSettings();
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setInitialLoading(false);
      }
    };
  
    if (user && initialLoading) {
      loadSettings();
    }
  }, [user, initialLoading, fetchSettings]);

  // Update the notification states initialization
useEffect(() => {
  if (user) {
    setFullName(`${user.first_name} ${user.last_name}`.trim());
    setEmail(user.email);
    setWhatsappNumber(user.phone);
    setWhatsappChannelName(user.group_name);
   
  }
}, [user]);

  
  
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setErrorMessage('');
      
      await saveSettings({
        name: fullName,
          email,
          phone: whatsappNumber,
          group_name: whatsappChannelName
       
      });
      
      setSuccessMessage('Profile updated successfully');
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };
  

  
  if (loading || initialLoading ) {
    return <Preloader fullScreen state="settings" />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.subtitle}>Manage your profile and notification preferences</p>
      </div>
      
      {formSubmitted && successMessage && (
        <div className={styles.successAlert} role="alert">
          <span>{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className={styles.errorAlert} role="alert">
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className={styles.content}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Settings</h2>
            </div>
            <nav className={styles.sidebarNav}>
              <button 
                className={`${styles.navButton} ${activeTab === 'profile' ? styles.activeNavButton : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className={styles.navIcon} /> Profile
              </button>
              {/** 
              <button 
                className={`${styles.navButton} ${activeTab === 'notifications' ? styles.activeNavButton : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className={styles.navIcon} /> Notifications
              </button>
              */}
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentCard}>
            {activeTab === 'profile' && (
              <>
                <h2 className={styles.contentTitle}>Profile Information</h2>
                <form onSubmit={handleProfileSubmit}>
                  <div className={styles.formFields}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fullName" className={styles.formLabel}>
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="whatsappNumber" className={styles.formLabel}>
                        WhatsApp Number
                      </label>
                      <input
                        id="whatsappNumber"
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="whatsappChannelName" className={styles.formLabel}>
                        WhatsApp Channel/Group Name
                      </label>
                      <input
                        id="whatsappChannelName"
                        type="text"
                        value={whatsappChannelName}
                        onChange={(e) => setWhatsappChannelName(e.target.value)}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div>
                      <button type="submit" className={styles.submitButton}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
            
            {activeTab === 'notifications' && (
              <>
                <h2 className={styles.contentTitle}>Notification Preferences</h2>
                <form >
                  <div className={styles.formFields}>
                    <div className={styles.formGroup}>
                      <div className={styles.formLabel}>
                        <FaEnvelope className={styles.formIcon} />
                        <p className={styles.formText}>Email Notifications</p>
                      </div>
                      <div className={styles.formCheckbox}>
                        <input 
                          type="checkbox" 
                          checked={emailNotifications} 
                          onChange={() => setEmailNotifications(!emailNotifications)}
                          className="sr-only peer" 
                        />
                        <div className={styles.formCheckboxIndicator}></div>
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <div className={styles.formLabel}>
                        <FaWhatsapp className={styles.formIcon} />
                        <p className={styles.formText}>WhatsApp Notifications</p>
                      </div>
                      <div className={styles.formCheckbox}>
                        <input 
                          type="checkbox" 
                          checked={whatsappNotifications} 
                          onChange={() => setWhatsappNotifications(!whatsappNotifications)}
                          className="sr-only peer" 
                        />
                        <div className={styles.formCheckboxIndicator}></div>
                      </div>
                    </div>
                    
                    <div>
                      <button type="submit" className={styles.submitButton}>
                        Save Notification Preferences
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Show preloader when saving settings */}
      {saving && <Preloader fullScreen state="settings_save" />}
    </div>
  );
} 