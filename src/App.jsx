import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Vote from './pages/Vote'
import Results from './pages/Results'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote/:sessionId" element={<Vote />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </Router>
  )
}

export default App