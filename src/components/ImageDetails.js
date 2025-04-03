import React from 'react';
import { useNavigate } from 'react-router-dom';

const ImageDetails = ({ image, onClose }) => {
  const navigate = useNavigate();

  const handleViewGallery = () => {
    navigate('/');
  };

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `image-${image._id}.jpg`; // You can customize the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this image!',
        text: 'I found this amazing image in the gallery',
        url: image.url,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(image.url)
        .then(() => alert('Image URL copied to clipboard!'))
        .catch((error) => console.log('Error copying to clipboard:', error));
    }
  };

  return (
    <div className="image-details-page">
      <div className="details-container">
        <button className="close-details" onClick={onClose}>×</button>
        <h2>Image Details</h2>
        
        <div className="details-image-container">
          <img 
            src={image.url} 
            alt="Uploaded" 
            className="details-image"
          />
        </div>

        <div className="details-info">
          <p><strong>Upload Date:</strong> {new Date(image.createdAt).toLocaleString()}</p>
          <p><strong>File Size:</strong> {(image.size / 1024 / 1024).toFixed(2)} MB</p>
          <p><strong>Dimensions:</strong> {image.width} x {image.height} pixels</p>
        </div>

        <div className="details-actions">
          <button 
            className="action-button download"
            onClick={handleDownload}
          >
            Download
          </button>
          <button 
            className="action-button share"
            onClick={handleShare}
          >
            Share
          </button>
          <button 
            className="action-button view-gallery"
            onClick={handleViewGallery}
          >
            View Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDetails; 