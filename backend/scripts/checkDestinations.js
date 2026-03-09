const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('../models/Destination');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Checking destinations...');
    
    try {
      const destinations = await Destination.find({}).populate('createdBy', 'email');
      console.log(`Found ${destinations.length} destinations:`);
      
      destinations.forEach(d => {
        const creatorEmail = d.createdBy ? d.createdBy.email : 'Unknown';
        console.log(`- Name: ${d.name}, Slug: ${d.slug}, Approved: ${d.approved}, Status: ${d.status}, CreatedBy: ${creatorEmail}`);
      });
      
      if (destinations.length === 0) {
        console.log('No destinations found. You might need to seed the database.');
      }
    } catch (err) {
      console.error('Error querying destinations:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
