import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });

  const categories = [
    'Mattresses',
    'Buckets',
    'Lamps',
    'Study Tables',
    'Books',
    'Electronics',
    'Furniture',
    'Kitchen Items',
    'Others'
  ];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const productData = response.data;
      setProduct(productData);
      setFormData({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        category: productData.category
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product details');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.put(`http://localhost:5000/api/products/${productId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Product updated successfully!');
      navigate(`/product/${productId}`);
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!product) return <div className="error-message">Product not found</div>;

  return (
    <div className="edit-product-container">
      <div className="edit-product-content">
        <div className="edit-header">
          <h1>Edit Product</h1>
          <p>Update your product listing</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="title">Product Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter product title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-textarea"
              placeholder="Describe your product in detail"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="form-input"
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="current-images">
            <h3>Current Images</h3>
            <div className="image-grid">
              {product.images && product.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Product ${index + 1}`} />
                  <span className="image-label">Image {index + 1}</span>
                </div>
              ))}
            </div>
            <p className="image-note">Note: Image editing is not available in this version</p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(`/product/${productId}`)} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct; 