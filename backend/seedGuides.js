const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config();

const guides = [
  {
    _id: new mongoose.Types.ObjectId('6963ffa629a682e6a93a20f2'),
    name: 'Shyam Shrestha',
    email: 'shyam@guide.com',
    role: 'guide',
    bio: 'Expert trekker with 10 years of experience in the Himalayas.',
    phoneNumber: '+977 9851012345',
    specialty: ['Trekking', 'Culture'],
    languages: ['Nepali', 'English'],
    verified: true
  },
  {
    _id: new mongoose.Types.ObjectId('6963ffa629a682e6a93a20f6'),
    name: 'Rita Maharjan',
    email: 'rita@guide.com',
    role: 'guide',
    bio: 'Expert in Newari culture and traditional architecture with 12 years of experience.',
    phoneNumber: '+977 9841234567',
    specialty: ['Cultural Heritage', 'Architecture'],
    languages: ['Nepali', 'English', 'Newari'],
    verified: true
  }
];

async function seedGuides() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const guideData of guides) {
      await User.findByIdAndUpdate(
        guideData._id,
        guideData,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded/Updated guide: ${guideData.name}`);
    }

    console.log('✅ All guides seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedGuides();
