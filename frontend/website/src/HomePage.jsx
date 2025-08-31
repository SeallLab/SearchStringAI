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
        setError("")
      } else {
        setError(data.message || 'Failed to create chat')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while creating chat.')
    }
  }

  const goToChatPage = () => {
    if (chatHash) {
      navigate(`/chat/${chatHash}`)
    } else {
      setError('Please enter or create a chat hash first.')
    }
  }

  return (
    <>
      <h1>Welcome to SLR Helper!</h1>

      <div>
        <input
          type="text"
          value={chatHash}
          onChange={(e) => setChatHash(e.target.value)}
          placeholder="Enter the chat Hash here..."
        />
        <p>
          {serverMessage}
        </p>
      </div>

      <div className="card">
        <button onClick={goToChatPage}> 
          Enter
        </button>

        <button onClick={createNewChat}>
          Create New Chat
        </button>
      </div>
      <div>
        <h4>About This Bot</h4>
        <p>
          This AI bot is designed to help researchers in generating search strings and inclusion/exclusion criteria 
          for their systematic literacture reviews!
          Create a chat and start by sending your research question and/or research goal! 
          After which, you can provide feedback and interact with the bot to further enhance its output! 
          Make sure you save the chat hash!
        </p>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p className="read-the-docs">
        Project by SE-ALL Lab @ University of Calgary
      </p>
    </>
  )
}

export default HomePage
