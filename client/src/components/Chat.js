import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Chat.css';

function Chat() {
  const { sellerId, productId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchChatData();
    const interval = setInterval(fetchMessages, 3000); // Poll for new messages
    return () => clearInterval(interval);
  }, [sellerId, productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      
      // Fetch other user details
      const userResponse = await axios.get(`http://localhost:5000/api/auth/user/${sellerId}`);
      setOtherUser(userResponse.data);
      
      // Fetch product details
      const productResponse = await axios.get(`http://localhost:5000/api/products/${productId}`);
      setProduct(productResponse.data);
      
      // Fetch messages
      await fetchMessages();
      
      setLoading(false);
    } catch (err) {
      console.error('Chat data fetch error:', err);
      setError('Failed to load chat');
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fixed: Use correct endpoint with productId first, then userId
      const response = await axios.get(
        `http://localhost:5000/api/messages/${productId}/${sellerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (content, messageType = 'text') => {
    try {
      const token = localStorage.getItem('token');
      const messageData = {
        receiver: sellerId,
        product: productId,
        content,
        messageType
      };

      if (messageType === 'offer') {
        messageData.offerAmount = parseFloat(offerAmount);
      }

      const response = await axios.post(
        'http://localhost:5000/api/messages',
        messageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, response.data]);
      setNewMessage('');
      setShowOfferModal(false);
      setOfferAmount('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
    }
  };

  const handleSendOffer = () => {
    if (offerAmount && parseFloat(offerAmount) > 0) {
      sendMessage(`I'm offering ₹${offerAmount} for this item.`, 'offer');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading chat...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="user-avatar">
            {otherUser?.profilePic ? (
              <img src={otherUser.profilePic} alt={otherUser.name} />
            ) : (
              <div className="avatar-placeholder">
                {otherUser?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <h3>{otherUser?.name}</h3>
            <p>📍 {otherUser?.hostel} - Room {otherUser?.room}</p>
          </div>
        </div>
        
        <div className="product-info">
          <img src={product?.images[0]} alt={product?.title} />
          <div>
            <h4>{product?.title}</h4>
            <p>₹{product?.price}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Start the conversation about this item!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender === user._id;
              const showDate = index === 0 || 
                formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

              return (
                <div key={message._id}>
                  {showDate && (
                    <div className="date-separator">
                      {formatDate(message.createdAt)}
                    </div>
                  )}
                  
                  <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                    <div className="message-content">
                      {message.messageType === 'offer' && (
                        <div className="offer-message">
                          <div className="offer-header">💰 Offer Made</div>
                          <div className="offer-amount">₹{message.offerAmount}</div>
                        </div>
                      )}
                      
                      {message.messageType === 'pickup' && (
                        <div className="pickup-message">
                          <div className="pickup-header">📍 Pickup Arranged</div>
                          <div className="pickup-details">
                            <p><strong>Location:</strong> {message.pickupLocation}</p>
                            <p><strong>Time:</strong> {new Date(message.pickupTime).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      
                      <p>{message.content}</p>
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => setShowOfferModal(true)}
          className="offer-btn"
          disabled={product?.status === 'sold'}
        >
          💰 Make Offer
        </button>
        
        <button 
          onClick={() => navigate(`/product/${productId}`)}
          className="view-product-btn"
        >
          👁️ View Product
        </button>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="message-input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          disabled={product?.status === 'sold'}
          rows="1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || product?.status === 'sold'}
        >
          ➤
        </button>
      </form>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Make an Offer</h3>
            <div className="offer-form">
              <div className="current-price">
                <p>Current Price: <strong>₹{product?.price}</strong></p>
              </div>
              
              <div className="form-group">
                <label>Your Offer Amount (₹):</label>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter your offer"
                  min="1"
                  max={product?.price}
                />
              </div>
              
              <div className="offer-note">
                <p>💡 Tip: Reasonable offers are more likely to be accepted!</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowOfferModal(false)}>Cancel</button>
              <button 
                onClick={handleSendOffer} 
                className="primary-btn"
                disabled={!offerAmount || parseFloat(offerAmount) <= 0}
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat; 