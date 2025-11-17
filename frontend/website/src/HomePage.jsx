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

      <div className="buttons">
        <button onClick={goToChatPage}> 
          Enter
        </button>

        <button onClick={createNewChat}>
          Create New Chat
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* <p className="read-the-docs">
        Project by SE-ALL Lab @ University of Calgary
      </p> */}
    </>
  )
}

export default HomePage
