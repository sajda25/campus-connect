import React, { useState } from 'react';
import axios from 'axios';

function ReportButton({ targetType, targetId }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const handleReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/reports', {
        targetType,
        targetId,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Report submitted successfully!');
      setShowModal(false);
    } catch (error) {
      setMessage('Failed to submit report.');
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="report-btn">🚩 Report</button>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Report {targetType === 'product' ? 'Product' : 'User'}</h3>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              style={{ width: '100%' }}
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleReport} disabled={!reason.trim()} className="primary-btn">Submit</button>
            </div>
            {message && <p>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default ReportButton;
