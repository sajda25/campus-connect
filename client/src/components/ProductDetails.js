import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    paymentMethod: 'cash',
    pickupLocation: '',
    pickupTime: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  console.log('ProductDetails component loaded');
  console.log('Product ID from params:', productId);
  console.log('Current state - Loading:', loading, 'Error:', error, 'Product:', product);
  
  if (product) {
    console.log('Product images:', product.images);
    console.log('Current image index:', currentImageIndex);
    console.log('Current image URL:', product.images?.[currentImageIndex]);
  }

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', productId);
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
      console.log('Product data received:', response.data);
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to fetch product details');
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${product.seller._id}/${product._id}`);
  };

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(`http://localhost:5000/api/transactions/create`, {
        productId: product._id,
        sellerId: product.seller._id,
        amount: product.price,
        paymentMethod: purchaseData.paymentMethod,
        pickupLocation: purchaseData.pickupLocation,
        pickupTime: purchaseData.pickupTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowPurchaseModal(false);
      navigate(`/transaction/${response.data.transaction._id}`);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  const handleMarkAsSold = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.patch(`http://localhost:5000/api/products/${productId}/sold`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProduct({ ...product, status: 'sold' });
      alert('Product marked as sold successfully!');
    } catch (error) {
      console.error('Failed to mark as sold:', error);
      alert('Failed to mark as sold. Please try again.');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!product) return <div className="error-message">Product not found</div>;

  const isOwner = user && product.seller._id === user._id;

  return (
    <div className="product-details-container">
      <div className="product-details-content">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <div style={{ border: '3px solid green', padding: '10px', margin: '10px' }}>
              <p>Debug: Image URL: {product.images?.[currentImageIndex]}</p>
              <p>Debug: Image exists: {product.images && product.images.length > 0 ? 'Yes' : 'No'}</p>
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.title}
                  className="product-main-image"
                  onError={(e) => {
                    console.error('Image failed to load:', product.images[currentImageIndex]);
                    console.error('Error event:', e);
                    e.target.src = 'https://via.placeholder.com/450x450?text=No+Image';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', product.images[currentImageIndex]);
                  }}
                  style={{ border: '2px solid red', maxWidth: '100%' }} // Temporary to see if img element exists
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>No Image Available</span>
                </div>
              )}
            </div>
            {product.status === 'sold' && (
              <div className="sold-overlay">
                <span>SOLD</span>
              </div>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.title} - ${index + 1}`}
                  className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <h1>{product.title}</h1>
            <div className="product-price">₹{product.price}</div>
            <div className="product-status">
              <span className={`status-badge ${product.status}`}>
                {product.status === 'available' ? 'Available' : 'Sold'}
              </span>
            </div>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-category">
            <h3>Category</h3>
            <span className="category-tag">{product.category || 'Uncategorized'}</span>
          </div>

          {/* Seller Information */}
          <div className="seller-info">
            <h3>Seller Information</h3>
            <div className="seller-card">
              <div className="seller-avatar">
                {product.seller.profilePic ? (
                  <img src={product.seller.profilePic} alt={product.seller.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="seller-details">
                <h4>{product.seller.name}</h4>
                <p>📍 {product.seller.hostel} - Room {product.seller.room}</p>
                <p>📧 {product.seller.email}</p>
                {product.seller.contactInfo && (
                  <p>📞 {product.seller.contactInfo}</p>
                )}
                <div className="seller-rating">
                  <span>⭐ {product.seller.rating || 0}/5</span>
                  <span>({product.seller.totalRatings || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            {!isOwner ? (
              <>
                <button 
                  onClick={handleContactSeller}
                  className="contact-btn"
                  disabled={product.status === 'sold'}
                >
                  💬 Contact Seller
                </button>
                
                <button 
                  onClick={() => setShowPurchaseModal(true)}
                  className="purchase-btn"
                  disabled={product.status === 'sold'}
                >
                  🛒 Buy Now
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate(`/edit-product/${product._id}`)}
                  className="edit-btn"
                >
                  ✏️ Edit Listing
                </button>
                
                <button 
                  onClick={handleMarkAsSold}
                  className="mark-sold-btn"
                  disabled={product.status === 'sold'}
                >
                  ✅ Mark as Sold
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Purchase</h3>
            <div className="purchase-form">
              <div className="form-group">
                <label>Payment Method:</label>
                <select 
                  value={purchaseData.paymentMethod}
                  onChange={(e) => setPurchaseData({...purchaseData, paymentMethod: e.target.value})}
                >
                  <option value="cash">Cash on Pickup</option>
                  <option value="upi">UPI</option>
                  <option value="paytm">Paytm</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Pickup Location:</label>
                <input
                  type="text"
                  placeholder="e.g., Hostel A, Room 101"
                  value={purchaseData.pickupLocation}
                  onChange={(e) => setPurchaseData({...purchaseData, pickupLocation: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Pickup Time:</label>
                <input
                  type="datetime-local"
                  value={purchaseData.pickupTime}
                  onChange={(e) => setPurchaseData({...purchaseData, pickupTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowPurchaseModal(false)}>Cancel</button>
              <button onClick={handlePurchase} className="primary-btn">
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails; 