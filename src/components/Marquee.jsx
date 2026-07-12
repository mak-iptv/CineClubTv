// src/components/Marquee.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Marquee = () => {
  const { t } = useLanguage();
  const text = `🔥 ${t('marquee') || 'NOVI FILMOVI SVAKI DAN! ★ GLEDAJ BESPLATNO!'} 🔥`;

  return (
    <div className="marquee-bar">
      <div className="marquee-track">
        <span>{text}</span>
        <span>{text}</span> {/* Dupliranje za kontinuitet */}
      </div>
    </div>
  );
};

export default Marquee;
