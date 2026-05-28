// Email validation
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return '';
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

// Name validation
export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return '';
};

// Phone validation (Nepal format)
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const re = /^[9][6-9]\d{8}$/;
  if (!re.test(phone.replace(/\D/g, ''))) {
    return 'Please enter a valid Nepal phone number (98XXXXXXXX)';
  }
  return '';
};

// Required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return '';
};

// URL validation
export const validateURL = (url) => {
  if (!url) return '';
  try {
    new URL(url);
    return '';
  } catch {
    return 'Please enter a valid URL';
  }
};

// Number validation
export const validateNumber = (value, min = null, max = null) => {
  if (value === '' || value === null || value === undefined) {
    return 'This field is required';
  }
  const num = Number(value);
  if (isNaN(num)) return 'Please enter a valid number';
  if (min !== null && num < min) return `Value must be at least ${min}`;
  if (max !== null && num > max) return `Value must be at most ${max}`;
  return '';
};

// Coordinate validation
export const validateCoordinate = (value, type = 'latitude') => {
  if (!value) return `${type} is required`;
  const num = Number(value);
  if (isNaN(num)) return `Please enter a valid ${type}`;
  if (type === 'latitude' && (num < -90 || num > 90)) {
    return 'Latitude must be between -90 and 90';
  }
  if (type === 'longitude' && (num < -180 || num > 180)) {
    return 'Longitude must be between -180 and 180';
  }
  return '';
};

// File validation
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = []) => {
  if (!file) return 'File is required';
  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / 1024 / 1024}MB`;
  }
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return '';
};

// Destination form validation
export const validateDestination = (data) => {
  const errors = {};
  
  errors.name = validateRequired(data.name, 'Destination name');
  errors.description = validateRequired(data.description, 'Description');
  errors.location = validateRequired(data.location, 'Location');
  errors.latitude = validateCoordinate(data.latitude, 'latitude');
  errors.longitude = validateCoordinate(data.longitude, 'longitude');
  errors.activityType = validateRequired(data.activityType, 'Activity type');
  errors.difficulty = validateRequired(data.difficulty, 'Difficulty level');
  
  return errors;
};

// Group form validation
export const validateGroup = (data) => {
  const errors = {};
  
  errors.title = validateRequired(data.title, 'Group title');
  errors.destination = validateRequired(data.destination, 'Destination');
  errors.maxMembers = validateNumber(data.maxMembers, 2, 20);
  errors.startDate = validateRequired(data.startDate, 'Start date');
  errors.endDate = validateRequired(data.endDate, 'End date');
  
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

