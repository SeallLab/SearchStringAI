import React from 'react';
import './SLRGuidePopup.css';

export default function SLRGuidePopup({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" onClick={onClose}>×</button>
        <img
          src="/SLRpracticalGuide.png"
          alt="SLR Practical Guide"
          className="guideImage"
        />
      </div>
    </div>
  );
}
