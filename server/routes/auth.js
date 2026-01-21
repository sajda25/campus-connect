const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { studentId, email, name, hostel, room, password, contactInfo } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ studentId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Student ID or email already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      studentId,
      email,
      name,
      hostel,
      room,
      password: hashedPassword,
      contactInfo,
    });
    await user.save();
    res.status(201).json({ message: 'Signup successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(400).json({ message: 'Invalid student ID or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid student ID or password.' });
    }
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        _id: user._id, // <-- add this line
        studentId: user.studentId, 
        name: user.name, 
        email: user.email, 
        hostel: user.hostel, 
        room: user.room, 
        contactInfo: user.contactInfo, 
        profilePic: user.profilePic 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user profile by ID (for chat functionality)
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    console.log('GET /api/auth/profile called');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received:', token);
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
    } catch (jwtErr) {
      console.log('JWT verification failed:', jwtErr.message);
      return res.status(401).json({ message: 'Invalid token', error: jwtErr.message });
    }
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('User not found for userId:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user);
    res.json(user);
  } catch (err) {
    console.log('Server error in /api/auth/profile:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'password' && user[key] !== undefined) {
        user[key] = req.body[key];
      }
    });
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 