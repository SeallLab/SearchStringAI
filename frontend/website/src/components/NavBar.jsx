import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css'; // CSS module import

export default function NavBar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.homeLink}>
        <img src="/bita_recolor.png" alt="SLR Helper Logo" className={styles.logo} />
        <span className={styles.title}>SLR Helper</span>
      </Link>
    </nav>
  );
}
