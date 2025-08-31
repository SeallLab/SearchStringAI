import { useState, useEffect } from 'react'
import '../ChatPage.css'
import { API_BASE, ENDPOINTS } from '../apiConfig'

function ChatSearchString({ chatHash }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchString, setSearchString] = useState('')
  const [searchStringFormat, setSearchStringFormat] = useState('')
  const [searchStringExists, setSearchStringExists] = useState(false)
  const [error, setError] = useState(null)

  const [availableFormats, setAvailableFormats] = useState([])
  const [showFormatsDropdown, setShowFormatsDropdown] = useState(false)
  const [loadingConversion, setLoadingConversion] = useState(false)

  // Fetch chat history
  useEffect(() => {
    const getChat = async () => {
      try {
        const response = await fetch(`${API_BASE}${ENDPOINTS.getChatHistory}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash_plain_text: chatHash }),
        })

        const data = await response.json()
        return data
      } catch (err) {
        console.error('Error:', err)
        setError('An error occurred while getting chat.')
        return null
      }
    }

    const populateChatHistory = async () => {
      const data = await getChat()
      if (data?.status && Array.isArray(data.chat_history)) {
        const formattedMessages = []
        data.chat_history.forEach((entry) => {
          formattedMessages.push({ sender: 'user', text: entry.user_message })
          formattedMessages.push({ sender: 'ai', text: entry.llm_response })
        })
        setMessages(formattedMessages)
        if (data.message_count > 0) {
          const latestEntry = data.chat_history[data.message_count - 1]
          setSearchString(latestEntry.search_string || '')
          setSearchStringFormat(latestEntry.search_string_format || '')
        }
      }
    }

    if (chatHash) populateChatHistory()
  }, [chatHash])

  // Fetch available formats on mount
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.conversionFormats}`)
        const data = await res.json()
        if (Array.isArray(data.formats)) {
          setAvailableFormats(data.formats)
        }
      } catch (err) {
        console.error('Error fetching formats:', err)
      }
    }

    fetchFormats()
  }, [])

  useEffect(() => {
    setSearchStringExists(searchString.trim() !== '')
  }, [searchString])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setMessages((prev) => [...prev, { sender: 'user', text: newMessage }])

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.prompt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_plain_text: chatHash, user_message: newMessage }),
      })

      const data = await response.json()

      if (data.status === true) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.llm_response }])
        setSearchString(data.updated_search_string || '')
        setSearchStringFormat(data.search_string_format || '')
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: "AI couldn't respond." }])
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error sending message.' }])
    }

    setNewMessage('')
  }

  const handleFormatClick = async (format) => {
    if (loadingConversion) return // avoid double-clicks
    if (format === searchStringFormat) {
      return
    }
    setLoadingConversion(true)

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.conversion}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash_plain_text: chatHash,
          conversion_format: format,
        }),
      })

      const data = await response.json()

      if (data.status === true) {
        // Append user message & AI response to chat
        setMessages((prev) => [
          ...prev,
          { sender: 'user', text: data.user_message || `Convert to ${format}` },
          { sender: 'ai', text: data.llm_response || 'Conversion response' },
        ])

        setSearchString(data.updated_search_string || searchString)
        setSearchStringFormat(data.current_format || format)
      } else {
        // Conversion failed, no update to chat or strings
        console.warn('Conversion failed:', data.message)
      }
    } catch (err) {
      console.error('Error during conversion:', err)
    } finally {
      setLoadingConversion(false)
      setShowFormatsDropdown(false) // close dropdown after selection
    }
  }

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat for Search String</h2>

      <div className="chat-history">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>{msg.text}</div>
        ))}
      </div>

      {searchStringExists && (
        <div className="search-string-div">
          <pre className="search-string">{searchString}</pre>

          <div className="format-display-row">
            <span className="search-string-format">
              <strong>Current Format:</strong> {searchStringFormat || 'Unknown'}
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
                .filter((format) => format !== searchStringFormat) // exclude current format
                .map((format, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleFormatClick(format)}
                    style={{ cursor: loadingConversion ? 'not-allowed' : 'pointer', opacity: loadingConversion ? 0.5 : 1 }}
                    className="format-option"
                  >
                    {format}
                  </li>
                ))}
            </ul>
          )}


          <button
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(searchString)}
          >
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
  )
}

export default ChatSearchString
