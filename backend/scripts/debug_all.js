const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Destination = require('../models/Destination');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  const u12 = await User.findOne({ email: 'sujalaadhikari12@gmail.com' });
  const u918 = await User.findOne({ email: 'sujalaadhikari918@gmail.com' });

  console.log('--- Account Check ---');
  if (u12) {
    const d12Count = await Destination.countDocuments({ createdBy: u12._id });
    console.log(`sujalaadhikari12@gmail.com (ID: ${u12._id}) has ${d12Count} destinations.`);
  }
  if (u918) {
    const d918Count = await Destination.countDocuments({ createdBy: u918._id });
    console.log(`sujalaadhikari918@gmail.com (ID: ${u918._id}) has ${d918Count} destinations.`);
  }

  console.log('\n--- Duplicate Check (Jalbire Falls) ---');
  const jalbires = await Destination.find({ name: /Jalbire/i }).populate('createdBy', 'email');
  jalbires.forEach(d => {
    console.log(`- ${d.name} | Creator: ${d.createdBy ? d.createdBy.email : 'None'} | ID: ${d._id}`);
  });

  const all = await Destination.find({}).populate('createdBy', 'email');
  console.log(`\n--- All Destinations (${all.length}) ---`);
  all.forEach(d => {
    console.log(`- ${d.name} | CreatedBy: ${d.createdBy ? d.createdBy.email : 'Unknown'}`);
  });

  mongoose.disconnect();
}
debug();
