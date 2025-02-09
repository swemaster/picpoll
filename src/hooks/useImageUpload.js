import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { sessionService } from '../services/supabase/session.service'
import { storageService } from '../services/supabase/storage.service'

export function useImageUpload() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  const addImages = (newImages) => {
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview)
    setImages(images.filter((_, i) => i !== index))
  }

  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }
    try {
      const compressedFile = await imageCompression(imageFile, options)
      return compressedFile
    } catch (error) {
      console.error('Error compressing image:', error)
      throw error
    }
  }

  const uploadImages = async () => {
    if (images.length < 2) {
      throw new Error('Please select at least 2 images')
    }

    setUploading(true)
    try {
      // Create session
      const session = await sessionService.create()

      // Compress and upload images
      const uploads = await Promise.all(
        images.map(async (image, index) => {
          const compressedFile = await compressImage(image.file)
          return storageService.uploadImage(session.id, compressedFile, index)
        })
      )

      // Link images to session
      await sessionService.addImagesToSession(session.id, uploads)

      return session.id
    } finally {
      setUploading(false)
    }
  }

  return {
    images,
    uploading,
    addImages,
    removeImage,
    uploadImages
  }
}