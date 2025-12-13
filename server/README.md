# BlazeStack Server

A robust Express.js server with MongoDB, TypeScript, and authentication.

## Features

- **TypeScript** - Type-safe code
- **Express.js** - Fast, unopinionated, minimalist web framework
- **MongoDB with Mongoose** - Elegant MongoDB object modeling
- **Authentication** - Secure cookie-based JWT authentication
  - HTTP-only cookies for enhanced security
  - Signed cookies to prevent tampering
  - Support for both cookie and Bearer token authentication
- **Authorization** - Role-based access control
- **Validation** - Request validation using express-validator
- **Error Handling** - Centralized error handling
- **Logging** - Logging using Winston
- **Security** - Helmet for security headers
- **CORS** - Cross-Origin Resource Sharing enabled with credentials
- **Compression** - Response compression
- **ESLint & Prettier** - Code linting and formatting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies

```bash
cd server
npm install
```

4. Create a `.env` file based on `.env.example`

```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/logout` - Logout user and clear cookie (protected)

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── .env.example        # Example environment variables
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
├── nodemon.json        # Nodemon configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```
