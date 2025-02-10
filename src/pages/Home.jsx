import { useNavigate, Link } from 'react-router-dom'
import { ImageDropzone } from '../components/ImageDropzone/ImageDropzone'
import { useImageUpload } from '../hooks/useImageUpload'

function Home() {
  const navigate = useNavigate()
  const { images, uploading, addImages, removeImage, uploadImages } = useImageUpload()

  const handleUpload = async () => {
    try {
      const sessionId = await uploadImages()
      navigate(`/results/${sessionId}`)
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Upload failed. Please try again.')
    }
  }

  return (
    <div className="upload-page common-styles">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>Pic Poll</h1>
      </Link>
      <p>Upload images to create an image ranking tournament</p>

      <div className="upload-container">
        <ImageDropzone
          images={images}
          onAddImages={addImages}
          onRemoveImage={removeImage}
        />

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={images.length < 2 || uploading}
        >
          {uploading ? 'Creating tournament...' : 'Start Tournament'}
        </button>
      </div>
    </div>
  )
}

export default Home