
# Bike Management System

A full-stack web application designed to help users manage their bikes, documents, service history, expenses, and personal profiles in one place.

## Features

- User Registration and Login
- Email OTP Verification
- Forgot and Reset Password
- Bike Registration and Management
- Search Bikes by Registration Number
- Document Upload and Management
- Document Expiry Status Tracking
- Service History Management
- Expense Tracking
- User Profile Management
- Password Change
- Multi-user Data Separation

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Other Tools
- Git
- GitHub
- Nodemailer
- Multer

## Project Structure

```text
BIKE MANAGEMENT/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── index.html
├── dashboard.html
├── mybike.html
├── documents.html
├── servicehistory.html
├── expenses.html
├── profile.html
├── script.js
├── style.css
└── README.md
```

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/svganesh0007-art/bike-management-system.git
```

2. Navigate to the project folder:

```bash
cd bike-management-system
```

3. Install backend dependencies:

```bash
cd Backend
npm install
```

4. Create a `.env` file inside the Backend folder and configure:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

5. Start the backend server:

```bash
node server.js
```

6. Open `index.html` using Live Server.

## Security

- Passwords are hashed using bcrypt.
- Email OTP verification is implemented.
- User-specific data access is maintained.
- Environment variables are used for sensitive credentials.

## Author

**Vasantha Ganesh S**

B.Tech – Artificial Intelligence and Data Science

National Engineering College


## Project Screenshots

### Dashboard

![Bike Management Dashboard](screenshots/dashboard.png)
