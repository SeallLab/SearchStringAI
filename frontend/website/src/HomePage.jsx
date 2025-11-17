import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { API_BASE, ENDPOINTS } from './apiConfig'

function HomePage() {
  const [chatHash, setChatHash] = useState('')
  const [serverMessage, setServerMessage] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Load from localStorage on component mount
  useEffect(() => {
    const savedHash = localStorage.getItem('chatHash')
    if (savedHash) {
      setChatHash(savedHash)
    }
  }, [])

  // Save to localStorage whenever chatHash changes
  useEffect(() => {
    if (chatHash) {
      localStorage.setItem('chatHash', chatHash)
    }
  }, [chatHash])

  // Create a new chat
  const createNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.createChat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.status === true) {
        setChatHash(data.hash)
        setServerMessage(data.message)
        setError('')
      } else {
        setError(data.message || 'Failed to create chat')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while creating chat.')
    }
  }

  // Check if chat hash exists and return a boolean
  const checkChatHash = async (hash) => {
    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS.getChatHistory}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_plain_text: hash }),
      })
      const data = await response.json()
      return data.status === true ? true : false
    } catch (err) {
      console.error('Error:', err)
      return false
    }
  }

  // Go to chat page if hash exists
  const goToChatPage = async () => {
    if (!chatHash) {
      setError('Please enter a chat ID first.')
      return
    }

    const exists = await checkChatHash(chatHash)
    if (exists) {
      setError('')
      navigate(`/chat/${chatHash}`)
    } else {
      setError('Chat with the given ID does not exist.')
    }
  }

  return (
    <>
      <section>
        <div className='introduction'>
          <h1>Hi! I'm SLRmentor!</h1>
          <h4>About This Bot</h4>
          <p id='explination'>
            SLRmentor helps researchers in starting their systematic literacture.
            I'll help you in generating search strings, inclusion/exclusion criteria, or
            simply answer any questions you might have about SLR's! 
            Start out by simply creating a new chat!
          </p>
        </div>

        <div className="inputfield">
          <p>
            Enter Chat ID to start:
          </p>
          <input
            type="text"
            value={chatHash}
            onChange={(e) => setChatHash(e.target.value)}
            placeholder="Chat ID"
          />

          {(error || serverMessage) && (
            <p className={error ? "error" : "server-message"}>
              {error || serverMessage}
            </p>
          )}

          <button className="enter-btn" onClick={goToChatPage}>
            Enter
          </button>

          <div className="or-divider">OR</div>

          <button className="newchat-btn" onClick={createNewChat}>
            Create New Chat
          </button>
        </div>
      </section>
    </>
  )
}

export default HomePage
