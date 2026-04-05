const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dropReviewIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const Review = mongoose.connection.collection('reviews');
    // The index name is likely 'destination_1_user_1'
    try {
      await Review.dropIndex('destination_1_user_1');
      console.log('Successfully dropped the unique review index.');
    } catch (e) {
      if (e.code === 27) {
        console.log('Index destination_1_user_1 not found, it might already be gone.');
      } else {
        console.error('Error dropping index:', e.message);
      }
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
};

dropReviewIndex();
