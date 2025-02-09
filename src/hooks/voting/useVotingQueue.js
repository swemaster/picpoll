import { useState, useCallback } from 'react'

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generatePairs(images) {
  if (!images || images.length < 2) return []

  const pairs = []
  for (let i = 0; i < images.length; i++) {
    for (let j = i + 1; j < images.length; j++) {
      pairs.push({
        image1: images[i],
        image2: images[j]
      })
    }
  }
  return shuffleArray(pairs)
}

export function useVotingQueue(images) {
  const [remainingPairs, setRemainingPairs] = useState([])
  const [recentlyShown, setRecentlyShown] = useState(new Set())
  const [currentPair, setCurrentPair] = useState(null)
  const [lastPair, setLastPair] = useState(null)

  const getNextPair = useCallback(() => {
    const eligiblePairs = remainingPairs.filter(pair =>
      !recentlyShown.has(pair.image1.id) &&
      !recentlyShown.has(pair.image2.id) &&
      (!lastPair || (pair.image1.id !== lastPair.image1.id && pair.image2.id !== lastPair.image2.id))
    )

    return eligiblePairs.length > 0 ? eligiblePairs[0] : remainingPairs[0]
  }, [remainingPairs, recentlyShown, lastPair])

  const advance = useCallback((winner, loser) => {
    const newRecent = new Set(recentlyShown)
    newRecent.add(winner.id)
    newRecent.add(loser.id)
    if (newRecent.size > 4) {
      const iterator = newRecent.values()
      newRecent.delete(iterator.next().value)
      newRecent.delete(iterator.next().value)
    }
    setRecentlyShown(newRecent)

    const nextPairs = [...remainingPairs.slice(1)]
    setRemainingPairs(nextPairs)

    if (nextPairs.length === 0) {
      setCurrentPair(null)
      return false
    }

    const nextPair = getNextPair()
    setCurrentPair(nextPair)
    setLastPair(nextPair)
    return true
  }, [remainingPairs, recentlyShown, getNextPair])

  const initialize = useCallback(() => {
    const pairs = generatePairs(images)
    setRemainingPairs(pairs)
    setCurrentPair(pairs[0])
    setLastPair(pairs[0])
  }, [images])

  return {
    currentPair,
    remainingCount: remainingPairs.length,
    totalPairs: images.length ? (images.length * (images.length - 1)) / 2 : 0,
    advance,
    initialize
  }
}