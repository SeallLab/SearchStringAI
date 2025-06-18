import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatPage from './ChatPage'
import HomePage from './HomePage'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat/:chatHash" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router
