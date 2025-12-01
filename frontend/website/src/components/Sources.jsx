import React, { useState } from 'react';
import styles from './Sources.module.css';

export default function Sources({ showSources }) {
  const [expanded, setExpanded] = useState(false);
  if (!showSources) return null;

  const toggle = () => setExpanded(prev => !prev);

  return (
    <div className={styles.wrapper}>
      <button className={styles.iconButton} onClick={toggle}>i</button>

      {expanded && (
        <div className={styles.sourceList}>
          <strong>Responses Powered by the following sources:</strong>
          <ul>
            <li>Paul Ralph et al. 2020. Empirical Standards for Software Engineering Research. arXiv:2010.03525.</li>
            <li>Paul Ralph and Sebastian Baltes. 2022. The Seven Types of Literature Review. ACM ESEC/FSE 2022.</li>
            <li>Moher D et al. 2009. PRISMA Statement. PLoS Med 6(7): e1000097.</li>
            <li>Borenstein M et al. 2009. Introduction to Meta-Analysis. Wiley.</li>
            <li>Cruzes DS and Tore Dybå. 2010. Evidence synthesis. ESEM ‘10.</li>
            <li>Kitchenham B and Charters S. 2007. Guidelines for SLRs.</li>
            <li>Miles MB, Huberman M, Saldana J. 2014. Qualitative Data Analysis. Sage.</li>
            <li>Petersen K et al. 2008. Systematic Mapping Studies. EASE.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
