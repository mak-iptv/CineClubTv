import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="dmca-text-content">
          <div className="user-counter">
            <span className="online-dot"></span>
            <span>{t('online_label')} <span id="onlineCount">{Math.floor(Math.random() * 130 + 120)}</span></span>
          </div>
          <p><strong>radio-malaprespa.duckdns.org/CineClub/</strong> NE VRŠI strimovanje videozapisa niti hostuje sadržaj bilo koje vrste. Videozapisi koje gledate hostovani su i prikazani sa stranica kao što su YouTube, netu.tv, Megavideo, itd.</p>
        </div>
        <div className="copyright-text">
          &copy; 2026 CineClub &amp; radio-malaprespa.duckdns.org. Sva prava pripadaju vlasnicima medija i eksternim hostovima.
        </div>
      </div>
    </footer>
  );
};

export default Footer;