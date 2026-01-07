import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import HomePage from "./HomePage";
import ChatPage from "./ChatPage";
import AppTour from "./components/AppTour";

function App() {
  const [runTour, setRunTour] = useState(false);

  const startTour = () => {
    // reset in case it's already running / stuck
    setRunTour(false);

    // start after DOM paints so Joyride can find targets
    requestAnimationFrame(() => setRunTour(true));
  };

  return (
    <BrowserRouter>
      <AppTour run={runTour} setRun={setRunTour} />

      <Routes>
        <Route path="/" element={<HomePage startTour={startTour} />} />
        <Route path="/chat/:chatHash" element={<ChatPage startTour={startTour} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
