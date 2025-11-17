import React from "react";
import styles from "./WhatsASLRPopup.module.css";

export default function WhatsASLRPopup({ onClose }) {
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
          src="/SEALL- SLRMentor Student Guide.pdf"
          className={styles.pdfViewer}
          title="What's an SLR PDF"
        />
      </div>
    </div>
  );
}
