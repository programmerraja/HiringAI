# BlazeStack Client

A modern React application with authentication UI for the BlazeStack server.

## Features

- **React 19** - Latest React version
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components
- **React Router** - Client-side routing
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Authentication** - Complete authentication flow with JWT and cookies

## Authentication Features

- **Sign In** - User login with email and password
- **Sign Up** - New user registration
- **Protected Routes** - Routes that require authentication
- **Automatic Token Handling** - Cookies handle authentication tokens
- **Logout** - Clear authentication state

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173.

## Project Structure

```
client/
├── src/
│   ├── components/       # UI components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   └── ui/           # UI components from shadcn/ui
│   ├── contexts/         # React contexts
│   ├── services/         # API services
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── index.html            # HTML template
```

## Authentication Flow

1. User enters credentials in the Sign In or Sign Up form
2. Form validation is performed using React Hook Form and Zod
3. Credentials are sent to the server via API
4. Server validates credentials and returns a JWT token in an HTTP-only cookie
5. Client stores user information in the AuthContext
6. Protected routes check the AuthContext for authentication status
7. Logout clears the cookie and the AuthContext

## Available Routes

- `/` - Home route (redirects to dashboard or sign in)
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/dashboard` - Dashboard (protected route)
