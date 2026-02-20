const isEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

const isStrongPassword = (password = "") => password.length >= 6;

module.exports = { isEmail, isStrongPassword };
