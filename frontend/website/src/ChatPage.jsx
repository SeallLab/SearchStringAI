import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from './components/NavBar'
import ChatSearchString from './components/ChatSearchString'
import ChatCriteria from './components/ChatCriteria'
import ChatMentor from './components/ChatMentor'
import SystemContext from './components/SystemContext'
import './ChatPage.css'

function ChatPage({ startTour }) {
  const { chatHash } = useParams()
  const [activeTab, setActiveTab] = useState('mentor')

  useEffect(() => {
    if (chatHash) {
      localStorage.setItem('chatHash', chatHash)
    }
  }, [chatHash])

  useEffect(() => {
    window.__setActiveChatTab = setActiveTab;
    return () => delete window.__setActiveChatTab;
  }, []);

  return (
    <>
      <NavBar startTour={startTour} />

      <div className="chatIDdisplay" id="chat-id-display">
        <span className="chatID-label">Chat ID:</span>
        <span className="chatID-value">{chatHash}</span>
      </div>

      <div className="chat-page-column">
        <div className="tabs-container" id="tabs-container">
          <button
            id="tab-mentor"
            className={`tab-button ${activeTab === 'mentor' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentor')}
          >
            Mentor Chat
          </button>

          <button
            id="tab-search-string"
            className={`tab-button ${activeTab === 'searchString' ? 'active' : ''}`}
            onClick={() => setActiveTab('searchString')}
          >
            Search String Chat
          </button>

          <button
            id="tab-criteria"
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

        {/* System context below chat */}
        <SystemContext chatHash={chatHash} />
      </div>
    </>
  )
}

export default ChatPage
