/**
 * Complete Image Update Script
 * 
 * This script combines both upload and update steps for convenience.
 * It uploads images to Cloudinary and immediately updates MongoDB.
 * 
 * Usage:
 * 1. Place images in backend/uploads/ directory (see CLOUDINARY_SETUP_INSTRUCTIONS.md)
 * 2. Ensure .env has Cloudinary credentials
 * 3. Run: node backend/scripts/updateDestinationImagesComplete.js
 */

const { uploadDestinationImages } = require('./uploadImagesToCloudinary');
const { updateDestinationImages } = require('./updateDestinationImages');
const path = require('path');
const fs = require('fs');

async function completeImageUpdate() {
  console.log('🚀 Starting complete image update process...\n');
  console.log('='.repeat(80));
  console.log('STEP 1: Uploading images to Cloudinary');
  console.log('='.repeat(80) + '\n');

  try {
    // Step 1: Upload to Cloudinary
    const uploadResults = await uploadDestinationImages();

    // Check if uploads were successful
    const hasValidUrls = Object.values(uploadResults).some(
      result => result.main && !result.main.includes('YOUR_CLOUD_NAME')
    );

    if (!hasValidUrls) {
      console.error('\n❌ No valid Cloudinary URLs found. Please check your uploads.');
      process.exit(1);
    }

    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: Updating MongoDB with Cloudinary URLs');
    console.log('='.repeat(80) + '\n');

    // Step 2: Update MongoDB
    // The updateDestinationImages script will automatically read from cloudinary-urls.json
    await updateDestinationImages();

    console.log('\n' + '='.repeat(80));
    console.log('✅ Complete! Images uploaded and database updated.');
    console.log('💡 Restart your server and clear browser cache to see changes.');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  }
}

// Run the complete process
if (require.main === module) {
  completeImageUpdate();
}

module.exports = { completeImageUpdate };

