import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './ChatPage.css'

function ChatPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchString, setSearchString] = useState('')
  const [serverMessage, setServerMessage] = useState('')
  const [error, setError] = useState(null)
  const { chatHash } = useParams()

  useEffect(() => {
    if (chatHash) {
      localStorage.setItem('chatHash', chatHash)
    }
  }, [chatHash])

  useEffect(() => {
    const getChat = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/getchathistory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
          setSearchString(data.chat_history[data.message_count - 1].search_string)
        }
      }
    }

    if (chatHash) {
      populateChatHistory()
      console.log(messages)
    }
  }, [chatHash])

  const sendMessage = async () => {
    console.log(messages)
    if (!newMessage.trim()) return

    setMessages((prev) => [...prev, { sender: 'user', text: newMessage }])

    try {
      const response = await fetch('http://127.0.0.1:5000/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash_plain_text: chatHash,
          user_message: newMessage,
        }),
      })

      const data = await response.json()

      if (data.status === true) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.llm_response }])
        setSearchString(data.updated_search_string)
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: "AI couldn't respond." }])
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error sending message.' }])
    }

    setNewMessage('')
  }

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat with Search String AI</h2>

      <div className="chat-history">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="search-string">
        <p>{searchString}</p>
      </div>

      <div>
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
    </div>
  )
}

export default ChatPage
