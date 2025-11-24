import React from 'react';
import styles from './Message.module.css';
import Sources from './Sources';

function Message({ title, message, sender, showSources }) {
  return (
    <div className={`${styles.messageBlock} ${styles[sender]}`}>
      <div className={`${styles.messageSender} ${styles[sender]}`}>{title}</div>
      <div className={`${styles.message} ${styles[sender]}`}>
        {message}

        {showSources && <Sources showSources={true} />}
      </div>
    </div>
  );
}

export default Message;
