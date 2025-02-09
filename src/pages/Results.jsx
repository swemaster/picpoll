import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { sessionService } from '../services/supabase/session.service'
import { voteService } from '../services/supabase/vote.service'
import '../index.css'

function Results() {
  const { sessionId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [shareUrl, setShareUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    loadResults()
    const voteUrl = `${window.location.origin}/vote/${sessionId}`
    setShareUrl(voteUrl)
  }, [sessionId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const session = await sessionService.getSession(sessionId)
      const votes = await voteService.getSessionVotes(sessionId)

      // Calculate rankings based on wins
      const rankings = calculateRankings(session.images, votes)
      setResults(rankings)
    } catch (err) {
      console.error('Error loading results:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateRankings = (images, votes) => {
    // Initialize win counts
    const winCounts = images.reduce((acc, img) => {
      acc[img.id] = {
        image: img,
        imageUrl: img.url || img.public_url, // Handle both url formats
        wins: 0,
        losses: 0
      }
      return acc
    }, {})

    // Count wins and losses
    votes.forEach(vote => {
      if (winCounts[vote.winner_id]) winCounts[vote.winner_id].wins += 1
      if (winCounts[vote.loser_id]) winCounts[vote.loser_id].losses += 1
    })

    // Convert to array and sort by win rate
    return Object.values(winCounts)
      .sort((a, b) => {
        const aRate = a.wins / (a.wins + a.losses) || 0
        const bRate = b.wins / (b.wins + b.losses) || 0
        return bRate - aRate
      })
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 3000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  if (loading) return <div className="loading">Loading results...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="results-page">
      <h1>Tournament Results</h1>

      <div className="share-section">
        <p>Share this link to get more votes:</p>
        <div className="share-url">
          <input
            type="text"
            value={shareUrl}
            readOnly
          />
          <button
            className={`copy-btn ${copySuccess ? 'copy-success' : ''}`}
            onClick={copyShareUrl}
            disabled={copySuccess}
          >
            {copySuccess ? 'Link copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="rankings">
        <h2>Current Rankings</h2>
        {results && results.map((item, index) => (
          <div key={item.image.id} className="ranking-item">
            <div className="rank">
              <span className={`rank-number rank-${index + 1}`}>{index + 1}</span>
            </div>
            <div className="image-container">
              <img
                src={item.image.url || item.image.public_url}
                alt={`Rank ${index + 1}`}
                onError={(e) => {
                  console.error('Image load error:', item.image)
                  e.target.src = 'https://via.placeholder.com/100?text=Error'
                }}
              />
            </div>
            <div className="stats">
              <div className="stat">Wins: {item.wins}</div>
              <div className="stat">Losses: {item.losses}</div>
              <div className="stat">
                Win Rate: {((item.wins/(item.wins + item.losses) || 0) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Results