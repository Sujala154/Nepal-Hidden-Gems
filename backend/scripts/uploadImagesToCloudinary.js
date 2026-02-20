/**
 * Script to upload destination images to Cloudinary
 * 
 * Usage:
 * 1. Place your image files in the 'uploads' directory (or specify custom path)
 * 2. Update the imagePaths object below with your file paths
 * 3. Run: node backend/scripts/uploadImagesToCloudinary.js
 * 
 * The script will upload images and output the Cloudinary URLs
 * Copy these URLs to use in the MongoDB update script
 */

const path = require('path');
const fs = require('fs');
const { uploadImage, uploadMultipleImages } = require('../config/cloudinary');

// Image file paths - UPDATE THESE WITH YOUR ACTUAL IMAGE PATHS
const imagePaths = {
  'rara-lake': {
    main: path.join(__dirname, '../uploads/rara-lake-main.jpg'),
    gallery: [
      path.join(__dirname, '../uploads/rara-lake-1.jpg'),
      path.join(__dirname, '../uploads/rara-lake-2.jpg'),
      path.join(__dirname, '../uploads/rara-lake-3.jpg'),
      path.join(__dirname, '../uploads/rara-lake-4.jpg'),
    ],
  },
  'bandipur': {
    main: path.join(__dirname, '../uploads/bandipur-main.jpg'),
    gallery: [
      path.join(__dirname, '../uploads/bandipur-1.jpg'),
      path.join(__dirname, '../uploads/bandipur-2.jpg'),
      path.join(__dirname, '../uploads/bandipur-3.jpg'),
    ],
  },
  'tsum-valley': {
    main: path.join(__dirname, '../uploads/tsum-valley-main.jpg'),
    gallery: [
      path.join(__dirname, '../uploads/tsum-valley-1.jpg'),
      path.join(__dirname, '../uploads/tsum-valley-2.jpg'),
      path.join(__dirname, '../uploads/tsum-valley-3.jpg'),
    ],
  },
};

async function uploadDestinationImages() {
  console.log('🚀 Starting Cloudinary image uploads...\n');

  const uploadResults = {};

  for (const [destinationSlug, images] of Object.entries(imagePaths)) {
    console.log(`📤 Uploading images for: ${destinationSlug}`);
    
    const result = {
      main: null,
      gallery: [],
    };

    // Upload main image
    if (fs.existsSync(images.main)) {
      console.log(`  → Uploading main image: ${path.basename(images.main)}`);
      const mainResult = await uploadImage(images.main, {
        folder: `nepal-hidden-gems/destinations/${destinationSlug}`,
        public_id: `${destinationSlug}-main`,
      });

      if (mainResult.success) {
        result.main = mainResult.url;
        console.log(`  ✅ Main image uploaded: ${mainResult.url}`);
      } else {
        console.error(`  ❌ Failed to upload main image: ${mainResult.error}`);
      }
    } else {
      console.warn(`  ⚠️  Main image not found: ${images.main}`);
    }

    // Upload gallery images
    const existingGalleryImages = images.gallery.filter(img => fs.existsSync(img));
    if (existingGalleryImages.length > 0) {
      console.log(`  → Uploading ${existingGalleryImages.length} gallery images...`);
      const galleryResults = await uploadMultipleImages(existingGalleryImages, {
        folder: `nepal-hidden-gems/destinations/${destinationSlug}`,
        public_id: `${destinationSlug}-gallery`,
      });

      galleryResults.forEach((galleryResult, index) => {
        if (galleryResult.success) {
          result.gallery.push(galleryResult.url);
          console.log(`  ✅ Gallery image ${index + 1} uploaded: ${galleryResult.url}`);
        } else {
          console.error(`  ❌ Failed to upload gallery image ${index + 1}: ${galleryResult.error}`);
        }
      });
    } else {
      console.warn(`  ⚠️  No gallery images found for ${destinationSlug}`);
    }

    uploadResults[destinationSlug] = result;
    console.log('');
  }

  // Output results in a format ready for MongoDB update
  console.log('\n📋 Cloudinary URLs (Copy these for MongoDB update):\n');
  console.log('='.repeat(80));
  console.log(JSON.stringify(uploadResults, null, 2));
  console.log('='.repeat(80));

  // Also save to a file for easy reference
  const outputPath = path.join(__dirname, '../uploads/cloudinary-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(uploadResults, null, 2));
  console.log(`\n💾 Results saved to: ${outputPath}`);

  return uploadResults;
}

// Run the script
if (require.main === module) {
  uploadDestinationImages()
    .then(() => {
      console.log('\n✅ Upload process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Upload process failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadDestinationImages };

