// src/components/AdblockNotice.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const AdblockNotice = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  // Proveri da li je korisnik već zatvorio obaveštenje
  useEffect(() => {
    const dismissed = localStorage.getItem('adblock_notice_dismissed');
    if (dismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('adblock_notice_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="adblock-notice">
      <div className="adblock-content">
        <span>{t('adblock_notice')}</span>
        <button onClick={handleDismiss} className="adblock-close">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default AdblockNotice;
