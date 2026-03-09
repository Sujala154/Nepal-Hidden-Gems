const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Destination = require('../models/Destination');

async function fixData() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const destinations = await Destination.find({});
  console.log(`Found ${destinations.length} destinations to check.`);

  for (const d of destinations) {
    let updated = false;

    if (!d.specialty) {
      d.specialty = `Experience the unique atmosphere of ${d.name}. This destination is known for its breathtaking vistas and serene environment that captures the soul of Nepal.`;
      updated = true;
    }

    if (!d.hospitality) {
      d.hospitality = `Enjoy the warm hospitality of the local community. Try traditional Nepalese dishes prepared with locally sourced ingredients, offering an authentic taste of the region.`;
      updated = true;
    }

    if (!d.accommodation) {
      d.accommodation = `Various stay options are available ranging from traditional home-stays to comfortable tea houses. Pricing is generally affordable, providing a great value-for-money experience.`;
      updated = true;
    }

    if (!d.tips) {
      d.tips = `Respect the local culture, carry enough cash as ATMs are rare in remote areas, and always carry a reusable water bottle to preserve the pristine nature of this gem.`;
      updated = true;
    }

    // Ensure status and approved are consistent
    if (d.approved && d.status !== 'approved') {
      d.status = 'approved';
      updated = true;
    }

    if (updated) {
      await d.save();
      console.log(`- Fixed missing data for: ${d.name}`);
    }
  }

  console.log('Data synchronization complete.');
  mongoose.disconnect();
}

fixData();
