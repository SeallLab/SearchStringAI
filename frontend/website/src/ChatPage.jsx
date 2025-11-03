import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from './components/NavBar' // adjust path if needed
import ChatSearchString from './components/ChatSearchString'
import ChatCriteria from './components/ChatCriteria'
import './ChatPage.css'
import ChatMentor from './components/ChatMentor'

function ChatPage() {
  const { chatHash } = useParams()
  const [activeTab, setActiveTab] = useState('searchString')

  useEffect(() => {
    if (chatHash) {
      localStorage.setItem('chatHash', chatHash)
    }
  }, [chatHash])

  return (
    <>
      <NavBar />
      <div className="chat-page-wrapper">
        <div className="tabs">
          <button
            className={activeTab === 'searchString' ? 'active' : ''}
            onClick={() => setActiveTab('searchString')}
          >
            Search String Chat
          </button>
          <button
            className={activeTab === 'criteria' ? 'active' : ''}
            onClick={() => setActiveTab('criteria')}
          >
            Criteria Chat
          </button>
          <button
            className={activeTab === 'mentor' ? 'active' : ''}
            onClick={() => setActiveTab('mentor')}
          >
            Mentor Chat
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'searchString' && <ChatSearchString chatHash={chatHash} />}
          {activeTab === 'criteria' && <ChatCriteria chatHash={chatHash} />}
          {activeTab === 'mentor' && <ChatMentor chatHash={chatHash} />}
        </div>
      </div>
    </>
  )
}

export default ChatPage
