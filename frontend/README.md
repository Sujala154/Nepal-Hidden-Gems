# Nepal Hidden Gems - Frontend

A community-driven tourism discovery platform for Nepal. This frontend is built with React, Vite, and Tailwind CSS.

## Features

- 🗺️ **Destination Discovery**: Browse and search hidden gems across Nepal
- 👥 **Group Finder**: Connect with travelers to share guide costs
- 📝 **Content Management**: Contributors can add and manage destinations
- 🔐 **Authentication**: Secure user authentication with role-based access
- 💳 **Payment Integration**: Support for eSewa, Khalti, and Stripe
- 🗺️ **Interactive Maps**: OpenStreetMap integration with Leaflet
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Leaflet** - Maps
- **Socket.io Client** - Real-time communication
- **React Icons** - Icons
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── admin/       # Admin-specific components
│   ├── auth/       # Authentication components
│   ├── common/     # Shared components (Button, Card, Input, etc.)
│   ├── contributor/# Contributor components
│   ├── group-finder/# Group finder components
│   ├── guide/      # Guide components
│   ├── payment/    # Payment components
│   └── traveler/   # Traveler components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── layout/         # Layout components
├── pages/          # Page components
├── routes/          # Route configuration
├── services/       # API service functions
├── styles/         # Global styles
└── utils/          # Utility functions
```

## Key Features Implementation

### Authentication
- User registration with role selection (Traveler/Contributor)
- Email verification
- Password reset functionality
- JWT-based authentication
- Protected routes with role-based access

### Destinations
- Browse and search destinations
- Filter by activity type, difficulty, season, location
- View destination details with maps
- Image gallery support
- Rating and reviews

### Group Finder
- Create and join travel groups
- Real-time messaging (Socket.io)
- Cost-sharing calculator
- Group management

### Admin Dashboard
- User management
- Content moderation
- Analytics and statistics
- Platform settings

## API Integration

The frontend communicates with the backend API. Make sure the backend server is running on the port specified in `.env`.

API endpoints are defined in `src/utils/constants.js` and services are in `src/services/`.

## Development Notes

- All API calls use Axios with interceptors for JWT token handling
- State management uses React Context API
- Form validation uses custom validators
- Toast notifications for user feedback
- Responsive design with mobile-first approach

## Contributing

1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Follow React best practices
4. Add proper error handling
5. Write clean, readable code

## License

This project is part of a Final Year Project (FYP) for academic purposes.
