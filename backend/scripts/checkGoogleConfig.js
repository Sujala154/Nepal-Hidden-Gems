// Diagnostic script to check Google OAuth configuration
require('dotenv').config();

console.log('\n=== GOOGLE OAUTH CONFIGURATION CHECK ===\n');

// Check environment variables
const checks = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'JWT_SECRET': process.env.JWT_SECRET ? '***SET***' : 'MISSING',
  'MONGO_URI': process.env.MONGO_URI ? '***SET***' : 'MISSING',
  'PORT': process.env.PORT || '5000 (default)'
};

console.log('Environment Variables:');
Object.entries(checks).forEach(([key, value]) => {
  const status = value && value !== 'MISSING' ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value || 'NOT SET'}`);
});

// Validate Google Client ID format
if (process.env.GOOGLE_CLIENT_ID) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const isValidFormat = clientId.includes('.apps.googleusercontent.com');
  console.log(`\nGoogle Client ID Format: ${isValidFormat ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`  Client ID: ${clientId.substring(0, 20)}...${clientId.substring(clientId.length - 20)}`);
}

// Check if required packages are installed
console.log('\nRequired Packages:');
try {
  require('google-auth-library');
  console.log('  ✅ google-auth-library');
} catch (e) {
  console.log('  ❌ google-auth-library (not installed)');
}

try {
  require('jsonwebtoken');
  console.log('  ✅ jsonwebtoken');
} catch (e) {
  console.log('  ❌ jsonwebtoken (not installed)');
}

console.log('\n=== END OF CHECK ===\n');

