import React, { useState } from 'react';
import styles from './Sources.module.css';

export default function Sources({ showSources }) {
  const [visible, setVisible] = useState(false);

  if (!showSources) return null;

  const togglePopup = () => {
    setVisible((prev) => !prev);
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.iconButton} onClick={togglePopup}>i</button>

      {visible && (
        <div className={styles.popup}>
          <strong>Responses Powered by the following sources:</strong>
          <ul>
            <li>Paul Ralph et al. 2020. Empirical Standards for Software Engineering Research. arXiv:2010.03525. Retrieved from https://arxiv.org/abs/2010</li>
            <li>Paul Ralph and Sebastian Baltes. 2022. Paving the Way for Mature Secondary Research: The Seven Types of Literature Review. Proceedings of The ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE 2022) Ideas, Visions and Reflections Track, Singapore: ACM, Nov. 14–18.</li>
            <li>Moher D, Liberati A, Tetzlaff J, Altman DG, The PRISMA Group (2009). Preferred Reporting Items for Systematic Reviews and Meta-Analyses: The PRISMA Statement. PLoS Med 6, 7: e1000097. doi:10.1371/journal.pmed1000097</li>
            <li>Michael Borenstein, Larry V. Hedges, Julian P.T. Higgins, Hannah R. Rothstein. 2009. Introduction to Meta-Analysis. John Wiley & Sons Ltd.</li>
            <li>Daniela S. Cruzes and Tore Dybå. 2010. Synthesizing evidence in software engineering research. In Proceedings of the 2010 ACM-IEEE International Symposium on Empirical Software Engineering and Measurement (ESEM ‘10). Association for Computing Machinery, New York, NY, USA, Article 1, 1–10. DOI:10.1145/1852786.1852788</li>
            <li>Barbara Kitchenham and Stuart Charters. 2007. Guidelines for performing Systematic Literature Reviews in Software Engineering.</li>
            <li>Matthew B. Miles, A. Michael Huberman, Jonny Saldana. 2014. Qualitative Data Analysis: A Methods Sourcebook. Sage Publications Inc.</li>
            <li>Kai Petersen, Robert Feldt, Shahid Mujtaba, Michael Mattsson. 2008. Systematic mapping studies in software engineering. In 12th International Conference on Evaluation and Assessment in Software Engineering (EASE). (Jun. 2008), 1–10.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
