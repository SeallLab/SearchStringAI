import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'


function ChatPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
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

    const fetchChat = async () => {
      const data = await getChat()
      console.log(data)
      // setMessages(data.history) or whatever
    }

    if (chatHash) {
      fetchChat()
    }
  }, [chatHash]) // only depends on chatHash now


  const sendMessage = async () => {
    if (!newMessage.trim()) return

    // Add user's message locally
    setMessages((prev) => [...prev, { sender: 'user', text: newMessage }])

    try {
      // Replace this with your actual POST request to send to AI
      const response = await fetch('http://127.0.0.1:5000/sendmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash_plain_text: chatHash,
          message: newMessage,
        }),
      })

      const data = await response.json()

      if (data.status === true) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }])
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
    <div style={{ padding: '2rem' }}>
      <h2>Chat with Search String AI</h2>

      <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'scroll', marginBottom: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '70%', padding: '0.5rem' }}
        />
        <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>
          Send {chatHash}
        </button>
      </div>
    </div>
  )
}

export default ChatPage
