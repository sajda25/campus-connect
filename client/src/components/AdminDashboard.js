import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
    fetchCategories();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reports');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/analytics/popular-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/reports/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReports();
    } catch (err) {
      setError('Failed to update report status');
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {analytics && (
        <div className="analytics-summary">
          <h3>Analytics Summary</h3>
          <ul>
            <li>Total Users: {analytics.totalUsers}</li>
            <li>Active Users: {analytics.activeUsers}</li>
            <li>Total Listings: {analytics.totalListings}</li>
            <li>Total Transactions: {analytics.totalTransactions}</li>
          </ul>
        </div>
      )}
      {categories.length > 0 && (
        <div className="popular-categories">
          <h3>Popular Categories</h3>
          <ul>
            {categories.map(cat => (
              <li key={cat._id}>{cat._id} ({cat.count})</li>
            ))}
          </ul>
        </div>
      )}
      <h3>Reports</h3>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Target</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report._id}>
                <td>{report.reporter?.name}</td>
                <td>{report.targetId}</td>
                <td>{report.targetType}</td>
                <td>{report.reason}</td>
                <td>{report.status}</td>
                <td>
                  <select value={report.status} onChange={e => handleStatusChange(report._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
