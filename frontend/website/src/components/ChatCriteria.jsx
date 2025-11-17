import { useState, useEffect } from 'react';
import Message from './Message';
import '../ChatPage.css';
import { API_BASE, ENDPOINTS } from '../apiConfig';

function ChatCriteria({ chatHash }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [criteria, setCriteria] = useState('');
  const [criteriaExists, setCriteriaExists] = useState(false);
  const [error, setError] = useState(null);

  // Fetch chat history
  useEffect(() => {
    const getChat = async () => {
      try {
        const response = await fetch(`${API_BASE}${ENDPOINTS.getCriteriaChatHistory}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash_plain_text: chatHash }),
        });
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while getting criteria chat.');
        return null;
      }
    };

    const populateChatHistory = async () => {
      const data = await getChat();
      const formattedMessages = [];

      if (data?.status && Array.isArray(data.chat_history)) {
        data.chat_history.forEach((entry) => {
          if (entry.user_message?.trim()) {
            formattedMessages.push({
              sender: 'user',
              title: 'You',
              message: entry.user_message,
            });
          }

          if (entry.llm_response?.trim()) {
            formattedMessages.push({
              sender: 'ai',
              title: 'SLRmentor',
              message: entry.llm_response,
            });
          }
        });

        // Set criteria from last entry if present
        const lastEntry = data.chat_history[data.chat_history.length - 1];
        if (lastEntry?.criteria) setCriteria(lastEntry.criteria);
      }

      // If chat history is empty, add AI greeting
      if (formattedMessages.length === 0) {
        formattedMessages.push({
          sender: 'ai',
          title: 'SLRmentor',
          message: 'Hello👋 I am SLRmentor. You can ask me here about SLR inclusion/Exclusion Criteria. How can I help you today?',
        });
      }

      setMessages(formattedMessages);
    };

    if (chatHash) populateChatHistory();
  }, [chatHash]);

  useEffect(() => {
    setCriteriaExists(criteria.trim() !== '');
  }, [criteria]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', title: 'You', message: newMessage },
    ]);

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.criteria}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_plain_text: chatHash, user_message: newMessage }),
      });

      const data = await response.json();

      if (data.status === true && data.llm_response?.trim()) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', title: 'SLRmentor', message: data.llm_response },
        ]);
        setCriteria(data.updated_criteria || '');
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', title: 'SLRmentor', message: 'Error sending message.' },
      ]);
    }

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat for Inclusion/Exclusion Criteria</h2>

      <div className="chat-history">
        {messages.map((msg, i) => (
          <Message key={i} sender={msg.sender} title={msg.title} message={msg.message} />
        ))}
      </div>

      {criteriaExists && (
        <>
          <div className="criteria-block">
            <h3 className="criteria-heading">Inclusion/Exclusion Criteria:</h3>
            <pre className="criteria-text">{criteria}</pre>
          </div>
          <div className="copy-button-wrapper">
            <button
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(criteria)}
            >
              Copy Criteria
            </button>
          </div>
        </>
      )}

      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

export default ChatCriteria;
