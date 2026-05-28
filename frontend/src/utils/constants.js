// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
  },
  DESTINATIONS: {
    LIST: '/destinations',
    CREATE: '/destinations',
    GET: (id) => `/destinations/${id}`,
    UPDATE: (id) => `/destinations/${id}`,
    DELETE: (id) => `/destinations/${id}`,
    SEARCH: '/destinations/search',
    MY_DESTINATIONS: '/destinations/my',
    APPROVE: (id) => `/destinations/${id}/approve`,
    REJECT: (id) => `/destinations/${id}/reject`,
  },
  GROUPS: {
    LIST: '/groups',
    CREATE: '/groups',
    GET: (id) => `/groups/${id}`,
    JOIN: (id) => `/groups/${id}/join`,
    LEAVE: (id) => `/groups/${id}/leave`,
    MESSAGES: (id) => `/groups/${id}/messages`,
    MY_GROUPS: '/groups/my',
  },
  PAYMENTS: {
    CREATE: '/payments/create',
    VERIFY: '/payments/verify',
    HISTORY: '/payments/history',
    REFUND: (id) => `/payments/${id}/refund`,
  },
  ADMIN: {
    USERS: '/admin/users',
    DESTINATIONS: '/admin/destinations',
    ANALYTICS: '/admin/analytics',
    STATS: '/admin/stats',
  },
};

// User Roles
export const USER_ROLES = {
  TRAVELER: 'traveler',
  CONTRIBUTOR: 'contributor',
  GUIDE: 'guide',
  ADMIN: 'admin', // System role, not available for public registration
};

// Destination Status
export const DESTINATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Activity Types
export const ACTIVITY_TYPES = [
  'Trekking',
  'Hiking',
  'Cultural Site',
  'Temple',
  'Waterfall',
  'Viewpoint',
  'Adventure',
  'Wildlife',
  'Photography',
  'Religious',
  'Historical',
  'Natural',
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
  { value: 'extreme', label: 'Extreme' },
];

// Seasons
export const SEASONS = [
  { value: 'spring', label: 'Spring (Mar-May)' },
  { value: 'summer', label: 'Summer (Jun-Aug)' },
  { value: 'autumn', label: 'Autumn (Sep-Nov)' },
  { value: 'winter', label: 'Winter (Dec-Feb)' },
  { value: 'all', label: 'All Year' },
];

// Payment Methods
export const PAYMENT_METHODS = {
  ESEWA: 'esewa',
  KHALTI: 'khalti',
  STRIPE: 'stripe',
};

// Group Status
export const GROUP_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  CLOSED: 'closed',
  COMPLETED: 'completed',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'nhg_token',
  USER: 'nhg_user',
  THEME: 'nhg_theme',
};

// Map Defaults
export const MAP_DEFAULTS = {
  CENTER: [28.3949, 84.1240], // Nepal center coordinates
  ZOOM: 7,
};

// Image Upload
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
};

