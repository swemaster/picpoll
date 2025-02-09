import './styles.css'

export function ImageDropzone({ images, onAddImages, onRemoveImage }) {
  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    onAddImages(newImages)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    onAddImages(newImages)
  }

  return (
    <>
      <input
        type="file"
        id="file-input"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('file-input').click()}
      >
        {images.length === 0 ? (
          <div className="drop-message">
            <p>Drop images here</p>
            <p>or click to select</p>
          </div>
        ) : (
          <div className="image-grid">
            {images.map((image, index) => (
              <div key={index} className="image-preview">
                <img src={image.preview} alt={`Upload ${index + 1}`} />
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveImage(index)
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}