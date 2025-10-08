# Etherstake Backend API

A robust backend API for the Etherstake application, providing authentication, user management, and staking functionality.

## Features

- **User Authentication**: Register, login, and profile management
- **Staking Management**: Create, view, and manage stakes
- **Role-Based Access Control**: User and admin roles with appropriate permissions
- **Security**: JWT authentication, password hashing, and rate limiting
- **Validation**: Request validation using Joi
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Comprehensive logging with Winston

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Joi**: Validation
- **Winston**: Logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd etherstake-backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

4. Start the development server

```bash
npm run dev
```

### Production Deployment

```bash
npm start
```

## API Documentation

### Authentication

#### Register a new user

```
POST /api/auth/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

#### Login

```
POST /api/auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get current user profile

```
GET /api/auth/me
```

Headers:

```
Authorization: Bearer <token>
```

### Staking

#### Create a new stake

```
POST /api/staking
```

Headers:

```
Authorization: Bearer <token>
```

Request body:

```json
{
  "amount": 1.5,
  "duration": 30,
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

#### Get user stakes

```
GET /api/staking
```

Headers:

```
Authorization: Bearer <token>
```

Query parameters:

```
page=1
limit=10
status=active|completed|cancelled
```

#### Get stake by ID

```
GET /api/staking/:id
```

Headers:

```
Authorization: Bearer <token>
```

#### Cancel stake

```
PATCH /api/staking/:id/cancel
```

Headers:

```
Authorization: Bearer <token>
```

### Admin Routes

#### Get all users

```
GET /api/users
```

Headers:

```
Authorization: Bearer <token>
```

#### Get all stakes

```
GET /api/staking/admin/all
```

Headers:

```
Authorization: Bearer <token>
```

## Project Structure

```
├── src/
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── utils/             # Utility functions
│   └── index.js           # App entry point
├── .env                   # Environment variables
├── .env.example          # Example environment variables
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## License

MIT