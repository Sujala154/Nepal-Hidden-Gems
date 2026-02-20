# Cloudinary Setup & Image Update Instructions

This guide will walk you through the complete process of uploading accurate destination images to Cloudinary and updating your MongoDB database.

## Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. **Image Files**: Have the correct, high-quality images ready for:
   - Rara Lake
   - Bandipur
   - Tsum Valley

## Step 1: Install Dependencies

```bash
cd backend
npm install cloudinary
```

## Step 2: Configure Cloudinary Credentials

Add your Cloudinary credentials to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**How to get your credentials:**
1. Log in to your Cloudinary dashboard
2. Go to Dashboard → Account Details
3. Copy the Cloud Name, API Key, and API Secret

## Step 3: Prepare Your Images

1. Create an `uploads` directory in the `backend` folder:
   ```bash
   mkdir backend/uploads
   ```

2. Place your images in the `uploads` directory with these naming conventions:
   ```
   backend/uploads/
   ├── rara-lake-main.jpg
   ├── rara-lake-1.jpg
   ├── rara-lake-2.jpg
   ├── rara-lake-3.jpg
   ├── rara-lake-4.jpg
   ├── bandipur-main.jpg
   ├── bandipur-1.jpg
   ├── bandipur-2.jpg
   ├── bandipur-3.jpg
   ├── tsum-valley-main.jpg
   ├── tsum-valley-1.jpg
   ├── tsum-valley-2.jpg
   └── tsum-valley-3.jpg
   ```

   **Note**: You can customize the file paths in `uploadImagesToCloudinary.js` if needed.

## Step 4: Upload Images to Cloudinary

Run the upload script:

```bash
node backend/scripts/uploadImagesToCloudinary.js
```

**What this script does:**
- Uploads all images to Cloudinary
- Organizes them in folders: `nepal-hidden-gems/destinations/{destination-slug}/`
- Outputs the Cloudinary URLs to console
- Saves URLs to `backend/uploads/cloudinary-urls.json`

**Expected Output:**
```
🚀 Starting Cloudinary image uploads...

📤 Uploading images for: rara-lake
  → Uploading main image: rara-lake-main.jpg
  ✅ Main image uploaded: https://res.cloudinary.com/...
  → Uploading 4 gallery images...
  ✅ Gallery image 1 uploaded: https://res.cloudinary.com/...
  ...

📋 Cloudinary URLs (Copy these for MongoDB update):
{
  "rara-lake": {
    "main": "https://res.cloudinary.com/...",
    "gallery": [...]
  },
  ...
}
```

## Step 5: Update MongoDB with Cloudinary URLs

The upload script automatically saves URLs to `cloudinary-urls.json`. The update script will use these automatically, OR you can manually update the `cloudinaryUrls` object in `updateDestinationImages.js`.

Run the MongoDB update script:

```bash
node backend/scripts/updateDestinationImages.js
```

**What this script does:**
- Connects to MongoDB
- Finds destinations by slug (rara-lake, bandipur, tsum-valley)
- Updates the `image` field with the new main image URL
- Updates the `multiple_images` array with gallery URLs
- Displays a summary of updates

**Expected Output:**
```
✅ Connected to MongoDB

🔄 Updating: rara-lake
  ✅ Updated successfully
     Main image: old_url → new_cloudinary_url
     Gallery: 4 → 4 images

📊 Update Summary:
✅ Successfully updated: 3
   - Rara Lake (rara-lake)
   - Bandipur (bandipur)
   - Tsum Valley (tsum-valley)
```

## Step 6: Verify Frontend Display

1. **Restart your backend server** (if running):
   ```bash
   npm run dev
   ```

2. **Clear browser cache** or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

3. **Check the frontend:**
   - Navigate to the Traveler Dashboard
   - Verify that Rara Lake, Bandipur, and Tsum Valley cards show the correct images
   - Check destination detail pages to ensure gallery images are correct

## Troubleshooting

### Issue: "CLOUDINARY_CLOUD_NAME is not defined"
**Solution**: Make sure your `.env` file has all three Cloudinary variables set.

### Issue: "Image file not found"
**Solution**: 
- Check that image files are in the correct location
- Verify file paths in `uploadImagesToCloudinary.js` match your file structure
- Ensure file extensions match (.jpg, .png, etc.)

### Issue: "Destination not found" in MongoDB update
**Solution**: 
- Verify the destination slugs match exactly: `rara-lake`, `bandipur`, `tsum-valley`
- Check that destinations exist in your database (run seed script if needed)

### Issue: Images not updating in frontend
**Solution**:
- Clear browser cache
- Restart backend server
- Verify MongoDB was updated correctly (check database directly)
- Check browser console for image loading errors

## Manual URL Update (Alternative Method)

If you prefer to manually update URLs, you can:

1. Upload images via Cloudinary dashboard
2. Copy the public URLs
3. Update `updateDestinationImages.js` with the URLs:

```javascript
const cloudinaryUrls = {
  'rara-lake': {
    main: 'https://res.cloudinary.com/your-cloud/image/upload/...',
    gallery: [
      'https://res.cloudinary.com/your-cloud/image/upload/...',
      // ... more URLs
    ],
  },
  // ... other destinations
};
```

4. Run the update script

## File Structure Reference

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── scripts/
│   ├── uploadImagesToCloudinary.js    # Upload script
│   ├── updateDestinationImages.js     # MongoDB update script
│   └── CLOUDINARY_SETUP_INSTRUCTIONS.md  # This file
├── uploads/                   # Place images here
│   ├── rara-lake-main.jpg
│   ├── bandipur-main.jpg
│   ├── tsum-valley-main.jpg
│   └── cloudinary-urls.json   # Auto-generated after upload
└── .env                       # Add Cloudinary credentials here
```

## Next Steps

After completing these steps:
1. ✅ Images are hosted on Cloudinary (fast CDN delivery)
2. ✅ MongoDB has accurate image URLs
3. ✅ Frontend displays correct destination images
4. ✅ All destination cards show location-specific photos

## Support

If you encounter issues:
1. Check Cloudinary dashboard for upload status
2. Verify MongoDB connection and destination documents
3. Check browser console for image loading errors
4. Review server logs for any errors

