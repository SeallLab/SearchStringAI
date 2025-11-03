import { useState, useEffect } from 'react';
import '../ChatPage.css';
import { API_BASE, ENDPOINTS } from '../apiConfig';

function ChatMentor({ chatHash }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);

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
      if (data?.status && Array.isArray(data.chat_history)) {
        const formattedMessages = [];
        data.chat_history.forEach((entry) => {
          formattedMessages.push({ sender: 'user', text: entry.user_message });
          formattedMessages.push({ sender: 'ai', text: entry.llm_response });
        });
        setMessages(formattedMessages);
      }
    };

    if (chatHash) populateChatHistory();
  }, [chatHash]);

  // Send message to Mentor endpoint
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: newMessage }]);

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.Mentor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash_plain_text: chatHash,
          user_message: newMessage,
        }),
      });

      const data = await response.json();

      if (data.status === true) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.llm_response }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: "AI couldn't respond." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error sending message.' }]);
    }

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat with Mentor</h2>

      <div className="chat-history">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>{msg.text}</div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

export default ChatMentor;
