import React from "react";
import styles from "./SLRGuidePanel.module.css";

export default function SLRGuidePanel({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose}>
        ✖
      </button>

      <div
        className={styles.popup}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src="/SLRguide.pdf"
          className={styles.pdfViewer}
          title="What's an SLR PDF"
        />
      </div>
    </div>
  );
}
