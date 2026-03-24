import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReportButton from './ReportButton';
import './UserProfile.css';

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [userProducts, setUserProducts] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Fetch user details
      const userResponse = await axios.get(`http://localhost:5000/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);
      setEditData(userResponse.data);
    } catch (err) {
      let errorMsg = 'Failed to load profile';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg += ': ' + err.response.data.message;
      } else if (err.message) {
        errorMsg += ': ' + err.message;
      }
      setError(errorMsg);
      setLoading(false);
      console.error('Profile fetch error:', err);
      return;
    }

    try {
      // Fetch user's products
      const productsResponse = await axios.get(`http://localhost:5000/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProducts(productsResponse.data);
    } catch (err) {
      let errorMsg = 'Failed to load listings';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg += ': ' + err.response.data.message;
      } else if (err.message) {
        errorMsg += ': ' + err.message;
      }
      setError(errorMsg);
      setLoading(false);
      console.error('Listings fetch error:', err);
      return;
    }

    try {
      // Fetch user's transactions
      const transactionsResponse = await axios.get(`http://localhost:5000/api/transactions/my-transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserTransactions(transactionsResponse.data);
    } catch (err) {
      let errorMsg = 'Failed to load transactions';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg += ': ' + err.response.data.message;
      } else if (err.message) {
        errorMsg += ': ' + err.message;
      }
      setError(errorMsg);
      setLoading(false);
      console.error('Transactions fetch error:', err);
      return;
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...user });
    setProfilePic(null);
    setProfilePicPreview('');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(editData).forEach(key => {
        if (editData[key] !== undefined && editData[key] !== null) {
          formData.append(key, editData[key]);
        }
      });
      
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }

      const response = await axios.put(`http://localhost:5000/api/auth/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsEditing(false);
      setProfilePic(null);
      setProfilePicPreview('');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProducts(userProducts.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getTransactionStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'confirmed': return 'blue';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{userProducts.length}</span>
            <span className="stat-label">Listings</span>
          </div>
          <div className="stat">
            <span className="stat-number">{userTransactions.length}</span>
            <span className="stat-label">Transactions</span>
          </div>
          <div className="stat">
            <span className="stat-number">{user.rating || 0}</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          📦 My Listings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          💰 Transactions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          ❤️ Wishlist
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-section">
            <div className="profile-pic-section">
              <div className="profile-pic">
                {(profilePicPreview || user.profilePic) ? (
                  <img 
                    src={profilePicPreview || user.profilePic} 
                    alt={user.name} 
                  />
                ) : (
                  <div className="avatar-placeholder large">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="profile-pic-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    id="profile-pic-input"
                  />
                  <label htmlFor="profile-pic-input" className="upload-btn">
                    📷 Change Photo
                  </label>
                </div>
              )}
            </div>

            <div className="profile-details">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hostel:</label>
                    <input
                      type="text"
                      value={editData.hostel || ''}
                      onChange={(e) => setEditData({...editData, hostel: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Room:</label>
                    <input
                      type="text"
                      value={editData.room || ''}
                      onChange={(e) => setEditData({...editData, room: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contact Info:</label>
                    <input
                      type="text"
                      value={editData.contactInfo || ''}
                      onChange={(e) => setEditData({...editData, contactInfo: e.target.value})}
                      placeholder="Phone number or additional contact info"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Bio:</label>
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      placeholder="Tell others about yourself..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="edit-actions">
                    <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                    <button onClick={handleSave} className="save-btn">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <h2>{user.name}</h2>
                  <p><strong>Student ID:</strong> {user.studentId}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Location:</strong> {user.hostel} - Room {user.room}</p>
                  {user.contactInfo && <p><strong>Contact:</strong> {user.contactInfo}</p>}
                  {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}
                  <p><strong>Rating:</strong> ⭐ {user.rating || 0}/5 ({user.totalRatings || 0} reviews)</p>
                  <p><strong>Member since:</strong> {formatDate(user.createdAt)}</p>
                  <button onClick={handleEdit} className="edit-profile-btn">
                    ✏️ Edit Profile
                  </button>
                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <ReportButton targetType="user" targetId={user._id} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="listings-content">
          <div className="listings-header">
            <h2>My Listings</h2>
            <button onClick={() => navigate('/add-product')} className="add-listing-btn">
              ➕ Add New Listing
            </button>
          </div>
          
          {userProducts.length === 0 ? (
            <div className="no-listings">
              <div className="no-listings-icon">📦</div>
              <h3>No listings yet</h3>
              <p>Start selling your items!</p>
              <button onClick={() => navigate('/add-product')} className="add-first-listing-btn">
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {userProducts.map(product => (
                <div key={product._id} className="listing-card">
                  <img src={product.images[0]} alt={product.title} />
                  <div className="listing-info">
                    <h3>{product.title}</h3>
                    <p className="price">₹{product.price}</p>
                    <p className="status">
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    </p>
                    <p className="date">Listed on {formatDate(product.createdAt)}</p>
                  </div>
                  <div className="listing-actions">
                    <button onClick={() => navigate(`/product/${product._id}`)}>
                      👁️ View
                    </button>
                    <button onClick={() => navigate(`/edit-product/${product._id}`)}>
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="transactions-content">
          <h2>Transaction History</h2>
          
          {userTransactions.length === 0 ? (
            <div className="no-transactions">
              <div className="no-transactions-icon">💰</div>
              <h3>No transactions yet</h3>
              <p>Your buying and selling history will appear here</p>
            </div>
          ) : (
            <div className="transactions-list">
              {userTransactions.map(transaction => (
                <div key={transaction._id} className="transaction-card">
                  <div className="transaction-product">
                    <img src={transaction.product.images[0]} alt={transaction.product.title} />
                    <div>
                      <h4>{transaction.product.title}</h4>
                      <p>₹{transaction.amount}</p>
                    </div>
                  </div>
                  
                  <div className="transaction-details">
                    <p><strong>Role:</strong> {transaction.buyer === user._id ? 'Buyer' : 'Seller'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </p>
                    <p><strong>Date:</strong> {formatDate(transaction.createdAt)}</p>
                    <p><strong>Payment:</strong> {transaction.paymentMethod}</p>
                  </div>
                  
                  <div className="transaction-actions">
                    <button onClick={() => navigate(`/transaction/${transaction._id}`)}>
                      👁️ View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <WishlistTab />
      )}
    </div>
  );
}

// Wishlist Tab Component
function WishlistTab() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;

  return (
    <div className="wishlist-content">
      <h2>My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="no-wishlist">
          <div className="no-wishlist-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Start browsing items and add them to your wishlist!</p>
          <button onClick={() => navigate('/products')} className="browse-btn">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item.product._id} className="wishlist-card">
              <img src={item.product.images[0]} alt={item.product.title} />
              <div className="wishlist-info">
                <h3>{item.product.title}</h3>
                <p className="price">₹{item.product.price}</p>
                <p className="seller">by {item.product.seller.name}</p>
              </div>
              <div className="wishlist-actions">
                <button onClick={() => navigate(`/product/${item.product._id}`)}>
                  👁️ View
                </button>
                <button 
                  onClick={() => removeFromWishlist(item.product._id)}
                  className="remove-btn"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserProfile; 