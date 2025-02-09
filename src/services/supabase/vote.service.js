import { supabase } from '../../lib/supabase'

export const voteService = {
  async recordVote(sessionId, winner, loser) {
    const { data, error } = await supabase
      .from('votes')
      .insert({
        session_id: sessionId,
        winner_id: winner.id,
        loser_id: loser.id
      })

    if (error) throw error
    return data
  },

  async getSessionVotes(sessionId) {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId)

    if (error) throw error
    return data
  }
}