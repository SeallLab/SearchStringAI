import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const [chatHash, setChatHash] = useState('') // Renamed for clarity
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
      const response = await fetch('http://127.0.0.1:5000/createchat', {
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
      <h1>Welcome to Search String AI!</h1>

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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p className="read-the-docs">
        Project by SE-ALL Labs @ University of Calgary
      </p>
    </>
  )
}

export default HomePage
