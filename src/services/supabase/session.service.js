import { supabase } from '../../lib/supabase'

export const sessionService = {
  async create() {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ created_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async addImagesToSession(sessionId, imageRecords) {
    const { error } = await supabase
      .from('images')
      .insert(
        imageRecords.map(record => ({
          session_id: sessionId,
          storage_path: record.path,
          public_url: record.url || '' // Added fallback empty string
        }))
      )

    if (error) throw error
  },

  async getSession(sessionId) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, images(*)')
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return data
  }
}