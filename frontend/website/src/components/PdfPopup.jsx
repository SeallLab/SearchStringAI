import React from "react";
import styles from "./PdfPopup.module.css";

export default function PdfPopup({ file, onClose }) {
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
          src={file}
          className={styles.pdfViewer}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}
