/**
 * MongoDB Update Script for Destination Images
 * 
 * This script updates the destination documents in MongoDB with new Cloudinary URLs
 * 
 * Usage:
 * 1. First, upload images to Cloudinary using uploadImagesToCloudinary.js
 * 2. Update the cloudinaryUrls object below with the URLs from Cloudinary
 * 3. Run: node backend/scripts/updateDestinationImages.js
 * 
 * The script will:
 * - Connect to MongoDB
 * - Update the 'image' and 'multiple_images' fields for each destination
 * - Display confirmation of updates
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Destination = require('../models/Destination');

// ============================================================================
// UPDATE THIS OBJECT WITH YOUR CLOUDINARY URLs
// ============================================================================
// After running uploadImagesToCloudinary.js, copy the URLs from the output
// or from the generated cloudinary-urls.json file
const cloudinaryUrls = {
  'rara-lake': {
    main: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/rara-lake/rara-lake-main.jpg',
    gallery: [
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/rara-lake/rara-lake-gallery_1.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/rara-lake/rara-lake-gallery_2.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/rara-lake/rara-lake-gallery_3.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/rara-lake/rara-lake-gallery_4.jpg',
    ],
  },
  'bandipur': {
    main: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/bandipur/bandipur-main.jpg',
    gallery: [
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/bandipur/bandipur-gallery_1.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/bandipur/bandipur-gallery_2.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/bandipur/bandipur-gallery_3.jpg',
    ],
  },
  'tsum-valley': {
    main: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/tsum-valley/tsum-valley-main.jpg',
    gallery: [
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/tsum-valley/tsum-valley-gallery_1.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/tsum-valley/tsum-valley-gallery_2.jpg',
      'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/nepal-hidden-gems/destinations/tsum-valley/tsum-valley-gallery_3.jpg',
    ],
  },
};

// Try to load URLs from the cloudinary-urls.json file if it exists
const urlsFilePath = path.join(__dirname, '../uploads/cloudinary-urls.json');
if (fs.existsSync(urlsFilePath)) {
  try {
    const savedUrls = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));
    console.log('📂 Found cloudinary-urls.json, using saved URLs\n');
    Object.assign(cloudinaryUrls, savedUrls);
  } catch (error) {
    console.warn('⚠️  Could not read cloudinary-urls.json, using hardcoded URLs\n');
  }
}

async function updateDestinationImages() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const updateResults = [];

    // Update each destination
    for (const [slug, urls] of Object.entries(cloudinaryUrls)) {
      console.log(`🔄 Updating: ${slug}`);

      // Check if URLs are placeholder values
      if (urls.main.includes('YOUR_CLOUD_NAME')) {
        console.warn(`  ⚠️  Skipping ${slug} - URLs appear to be placeholders`);
        console.warn(`     Please update cloudinaryUrls object with actual Cloudinary URLs\n`);
        continue;
      }

      try {
        // Find the destination by slug
        const destination = await Destination.findOne({ slug });

        if (!destination) {
          console.error(`  ❌ Destination not found: ${slug}`);
          continue;
        }

        // Store old URLs for logging
        const oldImage = destination.image;
        const oldGallery = [...(destination.multiple_images || [])];

        // Update the destination
        destination.image = urls.main;
        destination.multiple_images = urls.gallery || [];

        await destination.save();

        updateResults.push({
          slug,
          name: destination.name,
          success: true,
          oldImage,
          newImage: urls.main,
          oldGalleryCount: oldGallery.length,
          newGalleryCount: urls.gallery?.length || 0,
        });

        console.log(`  ✅ Updated successfully`);
        console.log(`     Main image: ${oldImage} → ${urls.main}`);
        console.log(`     Gallery: ${oldGallery.length} → ${urls.gallery?.length || 0} images\n`);
      } catch (error) {
        console.error(`  ❌ Error updating ${slug}:`, error.message);
        updateResults.push({
          slug,
          success: false,
          error: error.message,
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Update Summary:');
    console.log('='.repeat(80));
    
    const successful = updateResults.filter(r => r.success);
    const failed = updateResults.filter(r => !r.success);

    console.log(`✅ Successfully updated: ${successful.length}`);
    successful.forEach(result => {
      console.log(`   - ${result.name} (${result.slug})`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed updates: ${failed.length}`);
      failed.forEach(result => {
        console.log(`   - ${result.slug}: ${result.error}`);
      });
    }

    console.log('\n✅ MongoDB update process completed!');
    console.log('💡 Restart your server to see the changes in the frontend.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update process failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  updateDestinationImages();
}

module.exports = { updateDestinationImages };

