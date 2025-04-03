import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ImageDetails from './components/ImageDetails';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setImages([response.data, ...images]);
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadProgress(0);
      setIsUploading(false);
      
      // Show details page for the newly uploaded image
      setCurrentImage(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/images/${id}`);
      setImages(images.filter(img => img._id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageClick = (image) => {
    setCurrentImage(image);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setCurrentImage(null);
  };

  const Gallery = () => (
    <div className="App">
      <header className="App-header">
        <h1>Image Gallery</h1>
      </header>

      <div className="upload-form">
        <div className="file-input-container">
          <label className="file-input-label">
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
          </label>
        </div>

        {previewUrl && (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}

        {selectedFile && (
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        )}

        {isUploading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="image-grid">
        {images.map((image) => (
          <div key={image._id} className="image-card">
            <div
              className="image-container"
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.url}
                alt="Gallery"
                className="gallery-image"
              />
              <div className="image-overlay">
                <span className="view-text">View Details</span>
              </div>
            </div>
            <div className="image-footer">
              <p className="image-date">
                {new Date(image.createdAt).toLocaleDateString()}
              </p>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(image._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetails && currentImage && (
        <ImageDetails
          image={currentImage}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gallery />} />
      </Routes>
    </Router>
  );
}

export default App; 