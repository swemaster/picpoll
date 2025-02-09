import { supabase } from '../../lib/supabase'

export const storageService = {
  async uploadImage(sessionId, file, index) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${index}.${fileExt}`
      const filePath = `${sessionId}/${fileName}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get direct download URL instead of signed URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      // Add download parameter to force download instead of view
      const url = `${data.publicUrl}?download`

      return {
        path: filePath,
        url: url
      }
    } catch (error) {
      console.error('Storage service error:', error)
      throw error
    }
  }
}