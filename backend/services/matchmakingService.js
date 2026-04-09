const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

/**
 * Find potential partners for a traveler booking
 * Matches users booking the same destination, on the same date, also looking for a split tour
 */
exports.findPotentialPartners = async (booking, excludeIds = []) => {
  try {
    // Find other bookings with the same destination, date, and type='split'
    const potentialMatches = await Booking.find({
      destination: booking.destination, // Assuming destination stored, or use destinationName
      destinationName: booking.destinationName,
      date: {
        $gte: new Date(booking.date).setUTCHours(0, 0, 0, 0),
        $lt: new Date(booking.date).setUTCHours(23, 59, 59, 999)
      },
      type: 'split',
      matchStatus: 'searching',
      _id: { $ne: booking._id }, // Exclude the current booking
      user: { $nin: [booking.user, ...excludeIds] } // Exclude the same user and rejected partners
    })
      .populate('user', 'name profileImage')
      .sort({ searchStartTime: -1 }); // Prioritize longer searchers

    return potentialMatches;
  } catch (error) {
    console.error("findPotentialPartners error:", error);
    throw error;
  }
};

/**
 * Suggest a partner to a traveler
 * Updates the booking with suggestedPartnerId and notifies the traveler
 */
exports.suggestPartner = async (bookingId, suggestedPartnerId, guideId) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        matchStatus: 'partner_found',
        suggestedPartnerId: suggestedPartnerId
      },
      { new: true }
    )
      .populate('suggestedPartnerId', 'name profileImage')
      .populate('user', 'name email');

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Notify the traveler about the suggested partner
    await Notification.create({
      recipient: booking.user._id,
      sender: guideId,
      type: 'booking_update',
      title: 'Partner Match Suggested',
      message: `We found a potential partner match with ${booking.suggestedPartnerId.name} for your ${booking.destinationName} trip! Review and accept or decline.`,
      relatedId: bookingId
    });

    return booking;
  } catch (error) {
    console.error("suggestPartner error:", error);
    throw error;
  }
};

/**
 * Check for search timeout
 * If a traveler has been searching for too long without finding a match, they might want to switch to private
 * This can be called periodically or on demand
 */
exports.checkSearchTimeout = async (bookingId, timeoutMinutes = 30) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking || booking.matchStatus !== 'searching') {
      return null;
    }

    if (!booking.searchStartTime) {
      return null;
    }

    const now = new Date();
    const searchDuration = (now - new Date(booking.searchStartTime)) / (1000 * 60); // duration in minutes

    if (searchDuration > timeoutMinutes) {
      // Optionally notify the user that they've been searching for a while
      await Notification.create({
        recipient: booking.user,
        sender: null,
        type: 'booking_update',
        title: 'Still Searching for a Partner?',
        message: `You've been searching for a partner for ${timeoutMinutes} minutes. Would you like to continue searching or switch to a private tour?`,
        relatedId: bookingId
      });

      return {
        timedOut: true,
        duration: searchDuration
      };
    }

    return {
      timedOut: false,
      duration: searchDuration
    };
  } catch (error) {
    console.error("checkSearchTimeout error:", error);
    throw error;
  }
};

/**
 * Get matching stats for admin/guide dashboard
 */
exports.getMatchmakingStats = async (guideId) => {
  try {
    const stats = {
      totalSearching: await Booking.countDocuments({ guide: guideId, matchStatus: 'searching' }),
      totalPartnerFound: await Booking.countDocuments({ guide: guideId, matchStatus: 'partner_found' }),
      totalMatched: await Booking.countDocuments({ guide: guideId, matchStatus: 'matched' }),
      totalPrivate: await Booking.countDocuments({ guide: guideId, matchStatus: 'private' }),
      totalCancelled: await Booking.countDocuments({ guide: guideId, matchStatus: 'cancelled' })
    };

    return stats;
  } catch (error) {
    console.error("getMatchmakingStats error:", error);
    throw error;
  }
};
