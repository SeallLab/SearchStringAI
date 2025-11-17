import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from './components/NavBar'
import ChatSearchString from './components/ChatSearchString'
import ChatCriteria from './components/ChatCriteria'
import ChatMentor from './components/ChatMentor'
import './ChatPage.css'

function ChatPage() {
  const { chatHash } = useParams()
  const [activeTab, setActiveTab] = useState('mentor') // default to Mentor Chat first

  useEffect(() => {
    if (chatHash) {
      localStorage.setItem('chatHash', chatHash)
    }
  }, [chatHash])

  return (
    <>
      <NavBar />
      <div className="chatIDdisplay">
        <span className="chatID-label">Chat ID:</span>
        <span className="chatID-value">{chatHash}</span>
      </div>

      <div className="chat-page-wrapper">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'mentor' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentor')}
          >
            Mentor Chat
          </button>
          <button
            className={`tab-button ${activeTab === 'searchString' ? 'active' : ''}`}
            onClick={() => setActiveTab('searchString')}
          >
            Search String Chat
          </button>
          <button
            className={`tab-button ${activeTab === 'criteria' ? 'active' : ''}`}
            onClick={() => setActiveTab('criteria')}
          >
            Criteria Chat
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'mentor' && <ChatMentor chatHash={chatHash} />}
          {activeTab === 'searchString' && <ChatSearchString chatHash={chatHash} />}
          {activeTab === 'criteria' && <ChatCriteria chatHash={chatHash} />}
        </div>
      </div>
    </>
  )
}

export default ChatPage
