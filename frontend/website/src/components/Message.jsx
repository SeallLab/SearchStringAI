import React from 'react';
import './Message.css';

function Message({ title, message, sender }) {
  return (
    <div className={`message-block ${sender}`}>
      <div className={`message-sender ${sender}`}>{title}</div>
      <div className={`message ${sender}`}>{message}</div>
    </div>
  );
}

export default Message;
