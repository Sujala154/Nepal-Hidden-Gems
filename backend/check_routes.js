const express = require('express');
const app = express();

const routes = [
    ['/api/auth', './routes/authRoutes'],
    ['/api/destinations', './routes/destinationRoutes'],
    ['/api/admin', './routes/adminRoutes'],
    ['/api/profiles', './routes/profileRoutes'],
    ['/api/favorites', './routes/favoriteRoutes'],
    ['/api/guides', './routes/guideRoutes'],
    ['/api/bookings', './routes/bookingRoutes'],
    ['/api/contributors', './routes/contributorRoutes'],
    ['/api/chats', './routes/chatRoutes']
];

routes.forEach(([path, filePath]) => {
    try {
        const handler = require(filePath);
        console.log(`Checking ${path} (${filePath}):`, typeof handler === 'function' ? 'OK' : 'NOT A FUNCTION (' + typeof handler + ')');
    } catch (err) {
        console.log(`Error loading ${filePath}:`, err.message);
    }
});
