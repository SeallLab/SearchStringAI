import { useState, useEffect, useRef } from 'react';
import Message from './Message';
import styles from './ChatMentor.module.css';
import { API_BASE, ENDPOINTS } from '../apiConfig';

function ChatMentor({ chatHash }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);

  const chatRef = useRef(null); // ref for chat history container

  // Fetch mentor chat history
  useEffect(() => {
    const getMentorChat = async () => {
      try {
        const response = await fetch(`${API_BASE}${ENDPOINTS.getMentorchathistory}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash_plain_text: chatHash }),
        });
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while getting mentor chat.');
        return null;
      }
    };

    const populateChatHistory = async () => {
      const data = await getMentorChat();
      const formattedMessages = [];

      if (data?.status && Array.isArray(data.chat_history)) {
        data.chat_history.forEach((entry) => {
          if (entry.user_message?.trim()) {
            formattedMessages.push({
              sender: 'user',
              title: 'You',
              message: entry.user_message,
              showSources: false,
            });
          }
          if (entry.llm_response?.trim()) {
            formattedMessages.push({
              sender: 'ai',
              title: 'SLRmentor',
              message: entry.llm_response,
              showSources: true,
            });
          }
        });
      }

      if (formattedMessages.length === 0) {
        formattedMessages.push({
          sender: 'ai',
          title: 'SLRmentor',
          message:
            'Hello👋 I am SLRmentor. You can ask me here about systematic literature reviews in general! How can I help you today?',
          showSources: true,
        });
      }

      setMessages(formattedMessages);
    };

    if (chatHash) populateChatHistory();
  }, [chatHash]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', title: 'You', message: newMessage, showSources: false },
    ]);

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.Mentor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_plain_text: chatHash, user_message: newMessage }),
      });

      const data = await response.json();

      if (data.status === true && data.llm_response?.trim()) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', title: 'SLRmentor', message: data.llm_response, showSources: true },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', title: 'SLRmentor', message: 'Error sending message.', showSources: true },
      ]);
    }

    setNewMessage('');
  };

  return (
    <div className={styles['chat-mentor-wrapper']}>
      {/* Left image */}
      <img
        src="/slrguide.png"
        alt="SLR Practical Guide"
        className={styles['mentor-image']}
      />

      {/* Chat content */}
      <div className={styles['chat-content']}>
        <h2 className="chat-header">Chat with Mentor</h2>

        <div ref={chatRef} className={styles['chat-history']}>
          {messages.map((msg, i) => (
            <Message
              key={i}
              sender={msg.sender}
              title={msg.title}
              message={msg.message}
              showSources={msg.showSources}
            />
          ))}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask SLRmentor something about... SLRs!"
            className="chat-input"
          />
          <button onClick={sendMessage} className="send-button">
            Send
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

export default ChatMentor;
