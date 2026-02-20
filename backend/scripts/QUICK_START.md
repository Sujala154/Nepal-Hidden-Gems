# Quick Start: Update Destination Images

## 🚀 Fast Track (3 Steps)

### Step 1: Install Cloudinary
```bash
cd backend
npm install cloudinary
```

### Step 2: Add Cloudinary Credentials to `.env`
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Place Images & Run Script

1. **Place your images** in `backend/uploads/`:
   - `rara-lake-main.jpg`
   - `bandipur-main.jpg`
   - `tsum-valley-main.jpg`
   - (Optional: gallery images)

2. **Run the complete update script**:
   ```bash
   node backend/scripts/updateDestinationImagesComplete.js
   ```

That's it! The script will:
- ✅ Upload images to Cloudinary
- ✅ Update MongoDB with new URLs
- ✅ Show you a summary

## 📋 What You Need

1. **Cloudinary Account** (free at cloudinary.com)
2. **Image Files** (JPG/PNG, max 10MB each)
3. **MongoDB Connection** (already configured)

## 🔍 Verify Results

After running the script:
1. Restart your backend server
2. Clear browser cache (Ctrl+Shift+R)
3. Check Traveler Dashboard - images should be updated!

## 📚 Full Instructions

See `CLOUDINARY_SETUP_INSTRUCTIONS.md` for detailed steps and troubleshooting.

