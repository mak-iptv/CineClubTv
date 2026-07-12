// src/components/Marquee.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Marquee = () => {
  const { t } = useLanguage();

  return (
    <div className="marquee-bar">
      <marquee behavior="scroll" direction="left" scrollamount="4">
        🔥 {t('marquee') || 'NOVI FILMOVI SVAKI DAN! ★ GLEDAJ BESPLATNO!'} 🔥
      </marquee>
    </div>
  );
};

export default Marquee;