import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css';
import SLRGuidePanel from './SLRGuidePanel';
import PdfPopup from './PdfPopup';

export default function NavBar() {
  const [showSLRGuide, setShowSLRGuide] = useState(false);
  const [showPdfPopup, setShowPdfPopup] = useState(false);
  const [showHowToPopup, setShowHowToPopup] = useState(false);  // NEW STATE

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.homeLink}>
          <img src="/bita_recolor_with_hat.png" alt="SLRmentor Logo" className={styles.logo} />
          <span className={styles.title}>SLRmentor</span>
        </Link>

        <div className={styles.navButtons}>
          <button
            className={styles.navButton}
            onClick={() => setShowPdfPopup(prev => !prev)}
          >
            About SLRs
          </button>


          <button
            className={styles.navButton}
            onClick={() => setShowHowToPopup(prev => !prev)}  // SAME BEHAVIOUR
          >
            How to Use SLRmentor
          </button>
        </div>
      </nav>

      {showSLRGuide && (
        <SLRGuidePanel onClose={() => setShowSLRGuide(false)} />
      )}

      {showPdfPopup && (
        <PdfPopup
          file="/SEALL- SLRMentor Student Guide.pdf"
          onClose={() => setShowPdfPopup(false)}
        />
      )}

      {showHowToPopup && (   // NEW POPUP
        <PdfPopup
          file="/SLRmentor Guide.pdf"
          onClose={() => setShowHowToPopup(false)}
        />
      )}
    </>
  );
}
