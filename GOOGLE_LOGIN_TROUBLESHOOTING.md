# Google Login Troubleshooting Guide

## Step 1: Check Backend Console Logs

**CRITICAL**: When you try to sign in with Google, immediately check your **backend terminal** (where you run `npm start` or `npm run dev`).

You should see detailed logs like:

```
=== INCOMING REQUEST ===
=== GOOGLE LOGIN REQUEST RECEIVED ===
=== Google Login Attempt ===
Backend GOOGLE_CLIENT_ID: [your client ID]
```

**If there's an error, you'll see:**
```
=== GOOGLE LOGIN ERROR ===
Error type: [error type]
Error message: [THE ACTUAL ERROR]
Error code: [error code]
```

**SHARE THIS OUTPUT** - it will tell us exactly what's wrong!

---

## Step 2: Run Configuration Check

Run this diagnostic script to check your backend configuration:

```bash
cd backend
node scripts/checkGoogleConfig.js
```

This will verify:
- ✅ GOOGLE_CLIENT_ID is set
- ✅ JWT_SECRET is set
- ✅ MONGO_URI is set
- ✅ Required packages are installed

---

## Step 3: Common Errors and Fixes

### Error: "Invalid token signature" or "Token verification failed"

**Cause**: Backend `GOOGLE_CLIENT_ID` doesn't match frontend Client ID

**Fix**:
1. Check `backend/.env` file
2. Make sure it has: `GOOGLE_CLIENT_ID=358146582310-u92p8difhe0fmr2qa9s6gm64g85tnh8d.apps.googleusercontent.com`
3. **Restart your backend server** after changing `.env`

### Error: "JWT_SECRET is not configured"

**Cause**: Missing JWT_SECRET in backend `.env`

**Fix**:
1. Add to `backend/.env`: `JWT_SECRET=your_secret_key_here`
2. Use a strong random string (at least 32 characters)
3. **Restart backend server**

### Error: "User validation failed" or "password required"

**Cause**: User model validation issue (should be fixed now)

**Fix**: Already fixed in code - password is optional for Google users

### Error: "Duplicate key error" (MongoDB error code 11000)

**Cause**: User with same email or googleId already exists

**Fix**: The code now handles this - it will find and update existing users

### Error: "Database connection error"

**Cause**: MongoDB not connected or MONGO_URI incorrect

**Fix**:
1. Check `backend/.env` has correct `MONGO_URI`
2. Verify MongoDB is running
3. Check backend console for MongoDB connection status

---

## Step 4: Verify Environment Variables

Your `backend/.env` file **MUST** have:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=358146582310-u92p8difhe0fmr2qa9s6gm64g85tnh8d.apps.googleusercontent.com
PORT=5000
```

**Important**: 
- `GOOGLE_CLIENT_ID` must match frontend exactly
- `JWT_SECRET` must be set (for token generation)
- **Restart backend server** after changing `.env`

---

## Step 5: Test the Fix

1. **Restart your backend server** (important after .env changes)
2. **Try Google Sign-In** again
3. **Watch the backend console** for detailed error messages
4. **Check the error details** in the alert dialog

---

## What to Share for Help

If it still doesn't work, share:

1. **Backend console output** (the complete error logs when you try to sign in)
2. **Output from diagnostic script**: `node scripts/checkGoogleConfig.js`
3. **Your backend/.env file** (hide sensitive data, just show variable names and first/last few characters)

The backend now logs **very detailed** error information - check your backend terminal!

