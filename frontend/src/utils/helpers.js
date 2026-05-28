// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date time
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency
export const formatCurrency = (amount, currency = 'NPR') => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get initials
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!sessionStorage.getItem('nhg_token');
};

// Get user from sessionStorage
export const getUser = () => {
  const user = sessionStorage.getItem('nhg_user');
  return user ? JSON.parse(user) : null;
};

// Set user in sessionStorage
export const setUser = (user) => {
  sessionStorage.setItem('nhg_user', JSON.stringify(user));
};

// Remove user from sessionStorage
export const removeUser = () => {
  sessionStorage.removeItem('nhg_user');
  sessionStorage.removeItem('nhg_token');
};

// Get token from sessionStorage
export const getToken = () => {
  return sessionStorage.getItem('nhg_token');
};

// Set token in sessionStorage
export const setToken = (token) => {
  sessionStorage.setItem('nhg_token', token);
};

// Remove token from sessionStorage
export const removeToken = () => {
  sessionStorage.removeItem('nhg_token');
};

// Check if user has role
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

// Check if user is admin
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

// Check if user is contributor
export const isContributor = (user) => {
  return hasRole(user, 'contributor');
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone (Nepal format)
export const isValidPhone = (phone) => {
  const re = /^[9][6-9]\d{8}$/;
  return re.test(phone);
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+977-${cleaned}`;
  }
  return phone;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    open: 'blue',
    full: 'orange',
    closed: 'gray',
    completed: 'green',
  };
  return colors[status] || 'gray';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    open: 'Open',
    full: 'Full',
    closed: 'Closed',
    completed: 'Completed',
  };
  return labels[status] || status;
};

