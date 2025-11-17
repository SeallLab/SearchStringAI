import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css';
import SLRGuidePopup from './SLRGuidePopup';

export default function NavBar() {
  const [showSLRGuide, setShowSLRGuide] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.homeLink}>
          <img src="/bita_recolor.png" alt="SLRmentor Logo" className={styles.logo} />
          <span className={styles.title}>SLRmentor</span>
        </Link>

        <div className={styles.navButtons}>
          <button className={styles.navButton}>What's a SLR?</button>
          <button
            className={styles.navButton}
            onClick={() => setShowSLRGuide(true)}
          >
            SLR Guide
          </button>
          <button className={styles.navButton}>How to Use SLRmentor</button>
        </div>
      </nav>

      {showSLRGuide && <SLRGuidePopup onClose={() => setShowSLRGuide(false)} />}
    </>
  );
}
