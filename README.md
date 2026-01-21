# 🎓 Campus Connect

> A modern marketplace platform designed exclusively for campus communities to buy, sell, and exchange products seamlessly.

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

**Campus Connect** is a full-stack MERN (MongoDB, Express.js, React, Node.js) marketplace application tailored for college campuses. It provides a secure and intuitive platform where students can list items for sale, browse products, communicate with sellers through real-time chat, manage transactions, and maintain wishlists. The platform also includes an admin dashboard for monitoring platform analytics and managing reports.

## ✨ Features

### 🛍️ For Students

- **User Authentication & Authorization**
  - Secure signup/login with JWT tokens
  - Email verification system
  - Student ID validation
  - Profile management with hostel and room details

- **Product Management**
  - List products with multiple images
  - Edit and delete your listings
  - Categorized product browsing
  - Advanced search and filtering
  - Product status tracking (Available/Sold)

- **Real-Time Communication**
  - Built-in chat system to communicate with sellers
  - Message notifications
  - Chat history tracking

- **Transaction Management**
  - Complete purchase tracking
  - Transaction history
  - QR code generation for transactions
  - Buyer and seller transaction views

- **Wishlist**
  - Save favorite products
  - Quick access to saved items
  - Easy wishlist management

- **User Profiles**
  - View and edit profile information
  - Upload profile pictures
  - Display hostel and room information
  - User rating system
  - Personal bio

- **Reporting System**
  - Report suspicious listings or users
  - Spam and fraud detection
  - Community safety features

### 👨‍💼 For Admins

- **Admin Dashboard**
  - Platform analytics and statistics
  - Total users, listings, and transactions
  - Active users monitoring
  - Popular categories analysis

- **Content Moderation**
  - Review and manage reports
  - User management capabilities
  - Platform oversight tools

## ️ Tech Stack

### Frontend

- **React** (v19.1.0) - UI library
- **React Router DOM** (v7.7.1) - Navigation
- **Axios** (v1.11.0) - HTTP client
- **CSS3** - Styling

### Backend

- **Node.js** - Runtime environment
- **Express.js** (v4.18.2) - Web framework
- **MongoDB** - Database
- **Mongoose** (v7.0.3) - ODM

### Authentication & Security

- **JWT** (jsonwebtoken v9.0.0) - Token-based authentication
- **bcryptjs** (v2.4.3) - Password hashing

### Additional Libraries

- **Multer** (v2.0.2) - File upload handling
- **Nodemailer** (v7.0.6) - Email service
- **QRCode** (v1.5.4) - QR code generation
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **dotenv** (v16.0.3) - Environment variables

## 📥 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone the Repository

```bash
git clone https://github.com/yourusername/campus_connect.git
cd campus_connect
```

### Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file and add environment variables (see Environment Variables section)
touch .env

# Start the server
npm start
```

The server will run on `http://localhost:5000`

### Client Setup

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Start the React app
npm start
```

The client will run on `http://localhost:3000`

## 🚀 Usage

1. **Register an Account**
   - Sign up with your student ID, email, hostel, and room details
   - Verify your email address

2. **Browse Products**
   - Explore available products on the home page
   - Use filters to find specific items
   - View product details and seller information

3. **List a Product**
   - Click "Add Product"
   - Fill in product details and upload images
   - Submit your listing

4. **Chat with Sellers**
   - Click on a product
   - Start a conversation with the seller
   - Negotiate and arrange pickup

5. **Complete Transactions**
   - Mark items as sold
   - Track your purchase history
   - Generate QR codes for verification

6. **Admin Access** (for authorized users)
   - Access `/admin` route
   - View platform analytics
   - Manage reports and users

## 📁 Project Structure

```
campus_connect/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AddProduct.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── Chat.js
│   │   │   ├── EditProduct.js
│   │   │   ├── Footer.js
│   │   │   ├── Login.js
│   │   │   ├── Navbar.js
│   │   │   ├── ProductDetails.js
│   │   │   ├── ProductList.js
│   │   │   ├── ReportButton.js
│   │   │   ├── Signup.js
│   │   │   └── UserProfile.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── models/              # Mongoose schemas
│   │   ├── Message.js
│   │   ├── Product.js
│   │   ├── Report.js
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   ├── routes/              # API routes
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── messages.js
│   │   ├── products.js
│   │   ├── reports.js
│   │   ├── transactions.js
│   │   └── wishlist.js
│   ├── middleware/          # Custom middleware
│   │   └── auth.js
│   ├── utils/               # Utility functions
│   │   └── email.js
│   ├── uploads/             # Uploaded files
│   ├── index.js             # Entry point
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Auth required)
- `PUT /api/products/:id` - Update product (Auth required)
- `DELETE /api/products/:id` - Delete product (Auth required)
- `GET /api/products/user/:userId` - Get user's products

### Messages

- `GET /api/messages/:userId/:otherUserId` - Get conversation
- `POST /api/messages` - Send message (Auth required)

### Transactions

- `GET /api/transactions` - Get user transactions (Auth required)
- `POST /api/transactions` - Create transaction (Auth required)
- `GET /api/transactions/:id` - Get transaction details

### Wishlist

- `GET /api/wishlist` - Get user wishlist (Auth required)
- `POST /api/wishlist` - Add to wishlist (Auth required)
- `DELETE /api/wishlist/:productId` - Remove from wishlist (Auth required)

### Reports

- `POST /api/reports` - Create report (Auth required)
- `GET /api/reports` - Get all reports (Admin only)

### Analytics

- `GET /api/analytics/summary` - Get platform statistics (Admin only)
- `GET /api/analytics/popular-categories` - Get popular categories (Admin only)

## 🔐 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/campus_connect
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus_connect

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Campus Connect <noreply@campusconnect.com>

# Client URL (for email verification links)
CLIENT_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Coding Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - _Initial work_

## 🙏 Acknowledgments

- Thanks to the campus community for inspiration
- MongoDB for excellent documentation
- React team for the amazing framework
- All contributors who have helped this project grow

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

<p align="center">Made with ❤️ for Campus Communities</p>
