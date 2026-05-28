import { format, formatDistance, formatRelative } from 'date-fns';

// Format date
export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr);
  } catch {
    return '';
  }
};

// Format date time
export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'PPP p');
  } catch {
    return '';
  }
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatRelative(new Date(date), new Date());
  } catch {
    return '';
  }
};

// Format distance
export const formatDistanceTime = (date) => {
  if (!date) return '';
  try {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  } catch {
    return '';
  }
};

// Format currency (Nepal Rupees)
export const formatCurrency = (amount, currency = 'NPR') => {
  if (amount === null || amount === undefined) return 'NPR 0';
  const num = Number(amount);
  if (isNaN(num)) return 'NPR 0';
  
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Format number
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  const number = Number(num);
  if (isNaN(number)) return '0';
  return new Intl.NumberFormat('en-NP').format(number);
};

// Format percentage
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  const num = Number(value);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Format duration
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

// Format distance (km)
export const formatDistanceKm = (km) => {
  if (!km) return '0 km';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// Truncate text
export const truncate = (text, length = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Capitalize words
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    return `+977-${cleaned}`;
  }
  return phone;
};

// Format rating
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return Number(rating).toFixed(1);
};

