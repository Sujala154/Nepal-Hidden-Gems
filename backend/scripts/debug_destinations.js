const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Destination = require('../models/Destination');
const User = require('../models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const total = await Destination.countDocuments();
    console.log(`Total Destinations: ${total}`);

    const userStats = await Destination.aggregate([
      {
        $group: {
          _id: '$createdBy',
          count: { $sum: 1 }
        }
      }
    ]);

    for (const stat of userStats) {
      if (stat._id) {
        const user = await User.findById(stat._id);
        console.log(`User: ${user ? user.email : 'Unknown'} (${stat._id}) - Count: ${stat.count}`);
      } else {
        console.log(`User: No Creator assigned - Count: ${stat.count}`);
      }
    }

    const allDests = await Destination.find({}, 'name createdBy approved status');
    console.log('\nAll Destinations:');
    allDests.forEach(d => {
      console.log(`- ${d.name} | Creator ID: ${d.createdBy} | Status: ${d.status} | Approved: ${d.approved}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

check();
