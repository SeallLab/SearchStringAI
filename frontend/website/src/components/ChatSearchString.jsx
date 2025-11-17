import { useState, useEffect } from 'react';
import Message from './Message';
import '../ChatPage.css';
import { API_BASE, ENDPOINTS } from '../apiConfig';

function ChatSearchString({ chatHash }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchString, setSearchString] = useState('');
  const [searchStringFormat, setSearchStringFormat] = useState('');
  const [availableFormats, setAvailableFormats] = useState([]);
  const [showFormatsDropdown, setShowFormatsDropdown] = useState(false);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [error, setError] = useState(null);

  // Fetch chat history
  useEffect(() => {
    const getChat = async () => {
      try {
        const response = await fetch(`${API_BASE}${ENDPOINTS.getChatHistory}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash_plain_text: chatHash }),
        });
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while getting chat.');
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

        // Set search string from last chat entry if present
        const lastEntry = data.chat_history[data.chat_history.length - 1];
        if (lastEntry?.search_string) setSearchString(lastEntry.search_string);
        if (lastEntry?.search_string_format) setSearchStringFormat(lastEntry.search_string_format);
      }

      // If chat history is empty, add AI greeting
      if (formattedMessages.length === 0) {
        formattedMessages.push({
          sender: 'ai',
          title: 'SLRmentor',
          message: 'Hello! I am SLRmentor. You can ask me here about SLR search strings. How can I help you today?',
        });
      }

      setMessages(formattedMessages);
    };

    if (chatHash) populateChatHistory();
  }, [chatHash]);

  // Fetch available formats
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.conversionFormats}`);
        const data = await res.json();
        if (Array.isArray(data.formats)) setAvailableFormats(data.formats);
      } catch (err) {
        console.error('Error fetching formats:', err);
      }
    };
    fetchFormats();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', title: 'You', message: newMessage },
    ]);

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.prompt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_plain_text: chatHash, user_message: newMessage }),
      });
      const data = await response.json();

      // Only add AI response if non-empty
      if (data.status === true && data.llm_response?.trim()) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', title: 'SLRmentor', message: data.llm_response },
        ]);
        setSearchString(data.updated_search_string || '');
        setSearchStringFormat(data.search_string_format || '');
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
      <h2 className="chat-header">Chat for Search String</h2>

      <div className="chat-history">
        {messages.map((msg, i) => (
          <Message key={i} sender={msg.sender} title={msg.title} message={msg.message} />
        ))}
      </div>

      {searchString && (
        <div className="search-string-div">
          <pre className="search-string">{searchString}</pre>
          <div className="format-display-row">
            <span className="search-string-format">
              <strong>Current Format:</strong> {searchStringFormat || 'General'}
            </span>
            <button
              className="formats-toggle-button"
              onClick={() => setShowFormatsDropdown((prev) => !prev)}
              disabled={loadingConversion}
              title={loadingConversion ? 'Processing...' : 'Select different format'}
            >
              Different Formats
            </button>
          </div>

          {showFormatsDropdown && (
            <ul className="formats-dropdown">
              {availableFormats
                .filter((format) => format !== searchStringFormat)
                .map((format, idx) => (
                  <li key={idx}>{format}</li>
                ))}
            </ul>
          )}

          <button className="copy-button" onClick={() => navigator.clipboard.writeText(searchString)}>
            Copy Search String
          </button>
        </div>
      )}

      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={loadingConversion}
        />
        <button onClick={sendMessage} className="send-button" disabled={loadingConversion}>
          Send
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

export default ChatSearchString;
