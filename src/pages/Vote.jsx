import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useVoting } from '../hooks/useVoting'
import '../index.css'

function Vote() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { loading, error, currentPair, progress, vote } = useVoting(sessionId)
  const [direction, setDirection] = useState(null)

  const handleVote = async (winner, loser) => {
    const result = await vote(winner, loser)
    if (result === 'complete') {
      navigate(`/results/${sessionId}`)
    }
    setDirection(null)
  }

  if (loading) {
    return (
      <div className="vote-loading">
        <div className="loader"></div>
        <p>Finding your next match...</p>
      </div>
    )
  }

  if (error) {
    return <div className="vote-error">{error}</div>
  }

  if (!currentPair) {
    return <div className="vote-loading">Initializing matches...</div>
  }

  return (
    <div className="vote-container">
      <div className="vote-instructions">
        <p>
          Click on your preferred image to vote!
        </p>
      </div>

      <div className="cards-container">
        <div className="cards-split">
          <motion.div
            className="card"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleVote(currentPair.image1, currentPair.image2)}
          >
            <img
              src={currentPair.image1.url || currentPair.image1.public_url || currentPair.image1.storage_path}
              alt="Option 1"
              onError={(e) => {
                console.error('Image 1 load error:', currentPair.image1)
                e.target.src = 'https://via.placeholder.com/400?text=Error'
              }}
            />
            <div className="card-label">Option 1</div>
          </motion.div>

          <div className="vs vote-instructions"><p>VS</p></div>

          <motion.div
            className="card"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleVote(currentPair.image2, currentPair.image1)}
          >
            <img
              src={currentPair.image2.url || currentPair.image2.public_url || currentPair.image2.storage_path}
              alt="Option 2"
              onError={(e) => {
                console.error('Image 2 load error:', currentPair.image2)
                e.target.src = 'https://via.placeholder.com/400?text=Error'
              }}
            />
            <div className="card-label">Option 2</div>
          </motion.div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        >
        </div>
      </div>
    </div>
  )
}

export default Vote