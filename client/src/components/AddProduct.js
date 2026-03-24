import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

function AddProduct() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format price input to show currency
    if (name === 'price') {
      // Remove currency symbol and non-numeric characters for storage
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear any previous error messages
    if (message && messageType === 'error') {
      setMessage('');
      setMessageType('');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    const limitedFiles = files.slice(0, 5);
    setSelectedImages(limitedFiles);
    
    // Create preview URLs
    const previews = limitedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // Limit to 5 images
      const limitedFiles = imageFiles.slice(0, 5);
      setSelectedImages(limitedFiles);
      
      // Create preview URLs
      const previews = limitedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('Please login first');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    if (selectedImages.length === 0) {
      setMessage('Please select at least one image');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      
      // Append images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('🎉 Product added successfully! Redirecting...');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add product');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product">
      <div className="add-product-container">
        <h2>Sell Your Item</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>📝 Item Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter item title (e.g., Study Table, Mattress)"
              maxLength="100"
              required
            />
            <small>{formData.title.length}/100 characters</small>
          </div>
          
          <div className="form-group">
            <label>📖 Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item condition, features, and why someone should buy it..."
              maxLength="500"
              required
            />
            <small>{formData.description.length}/500 characters</small>
          </div>
          
          <div className="form-group">
            <label>💰 Price (₹):</label>
            <input
              type="text"
              name="price"
              value={formData.price ? `₹${formData.price}` : ''}
              onChange={handleChange}
              placeholder="₹0"
              required
            />
            <small>💡 Tip: Fair pricing gets more buyers!</small>
          </div>
          
          <div className="form-group">
            <label>🏷️ Category:</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="Mattresses">🛏️ Mattresses</option>
              <option value="Buckets">🪣 Buckets</option>
              <option value="Lamps">💡 Lamps</option>
              <option value="Study Tables">📚 Study Tables</option>
              <option value="Books">📖 Books</option>
              <option value="Electronics">📱 Electronics</option>
              <option value="Furniture">🪑 Furniture</option>
              <option value="Kitchen Items">🍳 Kitchen Items</option>
              <option value="Others">📦 Others</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>📸 Images (Max 5):</label>
            <div 
              className="drag-drop-area"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="icon">📸</div>
              <p>Drag & drop images here or click to browse</p>
              <small>Select up to 5 images (JPG, PNG, GIF)</small>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              style={{ display: 'none' }}
            />
          </div>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              <h4>✨ Selected Images:</h4>
              <div className="preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="remove-image"
                      title="Remove this image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? '🚀 Publishing Your Item...' : '🚀 Publish Item'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddProduct; 