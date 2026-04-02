const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: [true, 'A review must have a destination']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A review must have a user']
  }
}, { timestamps: true });

// Prevent user from submitting more than one review per destination
ReviewSchema.index({ destination: 1, user: 1 }, { unique: true });

// Static method to calculate average rating and save on the Destination
ReviewSchema.statics.calcAverageRatings = async function (destinationId) {
  const objId = new mongoose.Types.ObjectId(destinationId);
  const stats = await this.aggregate([
    {
      $match: { destination: objId }
    },
    {
      $group: {
        _id: '$destination',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    const Destination = mongoose.model('Destination');
    if (stats.length > 0) {
      // Round to 1 decimal place, e.g. 4.5
      await Destination.findByIdAndUpdate(destinationId, {
        rating: Math.round(stats[0].avgRating * 10) / 10, 
        numReviews: stats[0].nRating
      });
    } else {
      await Destination.findByIdAndUpdate(destinationId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error calculating average ratings:', error);
  }
};

// Call calcAverageRatings after saving a new review
ReviewSchema.post('save', function () {
  // this points to current review document
  this.constructor.calcAverageRatings(this.destination);
});

// Call calcAverageRatings after removing a review (e.g. if we add delete functionality later)
ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.destination);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
