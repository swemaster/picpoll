import { supabase } from '../../lib/supabase'
import { nanoid } from 'nanoid'

/**
* @typedef {Object} Image
* @property {string} id
* @property {string} session_id
* @property {string} storage_path
* @property {string} public_url
* @property {string} direct_url
* @property {string} created_at
*/

/**
* @typedef {Object} Session
* @property {string} id
* @property {string} created_at
* @property {string} title
* @property {string} status
* @property {string} expires_at
* @property {Image[]} images
*/

class SessionError extends Error {
 constructor(message, code) {
   super(message)
   this.name = 'SessionError'
   this.code = code
 }
}

export const sessionService = {
 /**
  * Create a new session
  * @returns {Promise<Session>}
  * @throws {SessionError}
  */
 async create() {
   try {
     const sessionId = nanoid(6)
     const now = new Date()
     const expiresAt = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)) // 3 days from now

     const { data, error } = await supabase
       .from('sessions')
       .insert({
         id: sessionId,
         created_at: now.toISOString(),
         expires_at: expiresAt.toISOString(),
         title: 'Image Ranking',
         status: 'active'
       })
       .select()
       .single()

     if (error) throw new SessionError('Failed to create session', 'CREATE_ERROR')
     return data
   } catch (error) {
     if (error instanceof SessionError) throw error
     throw new SessionError('Unexpected error creating session', 'UNKNOWN_ERROR')
   }
 },

 /**
  * Add images to a session
  * @param {string} sessionId
  * @param {Object[]} imageRecords
  * @param {string} imageRecords[].path
  * @param {string} imageRecords[].url
  * @returns {Promise<void>}
  * @throws {SessionError}
  */
 async addImagesToSession(sessionId, imageRecords) {
   try {
     if (!sessionId) throw new SessionError('Session ID is required', 'INVALID_ID')
     if (!Array.isArray(imageRecords) || imageRecords.length < 2) {
       throw new SessionError('At least 2 images are required', 'INVALID_IMAGES')
     }

     // First check if session is expired
     const { data: session } = await supabase
       .from('sessions')
       .select('expires_at')
       .eq('id', sessionId)
       .single()

     if (!session || new Date(session.expires_at) < new Date()) {
       throw new SessionError('Session has expired', 'SESSION_EXPIRED')
     }

     const { error } = await supabase
       .from('images')
       .insert(
         imageRecords.map(record => ({
           session_id: sessionId,
           storage_path: record.path,
           public_url: record.url,
           direct_url: record.url
         }))
       )

     if (error) {
       console.error('Database error:', error)
       throw new SessionError('Failed to add images to session', 'IMAGE_INSERT_ERROR')
     }
   } catch (error) {
     if (error instanceof SessionError) throw error
     throw new SessionError('Unexpected error adding images', 'UNKNOWN_ERROR')
   }
 },

 /**
  * Get a session by ID
  * @param {string} sessionId
  * @returns {Promise<Session>}
  * @throws {SessionError}
  */
 async getSession(sessionId) {
   try {
     if (!sessionId) throw new SessionError('Session ID is required', 'INVALID_ID')

     const { data, error } = await supabase
       .from('sessions')
       .select(`
         *,
         images (
           id,
           storage_path,
           public_url,
           direct_url,
           created_at
         )
       `)
       .eq('id', sessionId)
       .single()

     if (error) throw new SessionError('Failed to fetch session', 'FETCH_ERROR')
     if (!data) throw new SessionError('Session not found', 'NOT_FOUND')

     // Check if session is expired
     if (new Date(data.expires_at) < new Date()) {
       throw new SessionError('Session has expired', 'SESSION_EXPIRED')
     }

     return data
   } catch (error) {
     if (error instanceof SessionError) throw error
     throw new SessionError('Unexpected error fetching session', 'UNKNOWN_ERROR')
   }
 },

 /**
  * Check if a session is expired
  * @param {string} sessionId
  * @returns {Promise<boolean>}
  */
 async isExpired(sessionId) {
   try {
     const { data } = await supabase
       .from('sessions')
       .select('expires_at')
       .eq('id', sessionId)
       .single()

     if (!data) return true
     return new Date(data.expires_at) < new Date()
   } catch {
     return true
   }
 }
}