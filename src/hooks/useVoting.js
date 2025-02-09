import { useState, useEffect } from 'react'
import { sessionService } from '../services/supabase/session.service'
import { voteService } from '../services/supabase/vote.service'
import { useVotingQueue } from './voting/useVotingQueue'

export function useVoting(sessionId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [images, setImages] = useState([])
  const [votingComplete, setVotingComplete] = useState(false)
  const [queueInitialized, setQueueInitialized] = useState(false)

  const {
    currentPair,
    remainingCount,
    totalPairs,
    advance,
    initialize
  } = useVotingQueue(images)

  // First load the session
  useEffect(() => {
    loadSession()
  }, [sessionId])

  // Then initialize the queue when images are loaded
  useEffect(() => {
    if (images.length > 0 && !queueInitialized) {
      initialize()
      setQueueInitialized(true)
      setLoading(false)
    }
  }, [images, queueInitialized, initialize])

  const loadSession = async () => {
    try {
      const session = await sessionService.getSession(sessionId)
      if (!session || !session.images || session.images.length === 0) {
        throw new Error('No images found in session')
      }
      setImages(session.images)
    } catch (err) {
      console.error('Error loading session:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const vote = async (winner, loser) => {
    try {
      await voteService.recordVote(sessionId, winner, loser)

      const hasMorePairs = advance(winner, loser)
      if (!hasMorePairs) {
        setVotingComplete(true)
        return 'complete'
      }
      return 'next'
    } catch (err) {
      setError(err.message)
      return 'error'
    }
  }

  return {
    loading,
    error,
    currentPair,
    progress: {
      current: totalPairs - remainingCount + 1,
      total: totalPairs
    },
    vote,
    votingComplete
  }
}