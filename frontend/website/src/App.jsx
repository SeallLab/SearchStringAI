import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './HomePage'
import ChatPage from './ChatPage'
import AppTour from './components/AppTour'

function App() {
  const [runTour, setRunTour] = useState(false)

  return (
    <BrowserRouter>
      <AppTour run={runTour} setRun={setRunTour} />

      <Routes>
        <Route
          path="/"
          element={<HomePage startTour={() => setRunTour(true)} />}
        />
        <Route
          path="/chat/:chatHash"
          element={<ChatPage startTour={() => setRunTour(true)} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
