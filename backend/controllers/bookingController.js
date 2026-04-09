const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { guideId, guideName, destinationName, date, amount, type, groupId } = req.body;

    const bookingData = {
      user: req.user.id,
      guide: guideId,
      guideName,
      destinationName,
      date,
      amount,
      type,
      groupId, // Link to the group!
      status: req.body.status || "Pending",
      paymentStatus: "Unpaid"
    };

    // NEW: Initialize matchmaking fields for split bookings
    if (type === 'split') {
      bookingData.matchStatus = 'searching';
      bookingData.searchStartTime = new Date();
    } else {
      bookingData.matchStatus = 'private';
    }

    const booking = await Booking.create(bookingData);

    // Notify the guide
    await Notification.create({
      recipient: guideId,
      sender: req.user.id,
      type: 'booking', // Must match notification model enum
      title: 'New Booking Request',
      message: `${req.user.name} has requested a ${type} booking for ${destinationName} on ${new Date(date).toLocaleDateString()}.`,
      relatedId: booking._id
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: "Booking request sent successfully"
    });
  } catch (error) {
    console.error("createBooking error", error);
    res.status(500).json({ success: false, error: "Failed to send booking request" });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    let bookings = await Booking.find({ user: req.user.id })
      .populate("guide", "name email specialty languages profileImage")
      .populate({
        path: 'groupId',
        populate: {
          path: 'members.user',
          select: 'name profileImage'
        }
      })
      .sort({ createdAt: -1 });

    const Group = require('../models/Group');
    const Chat = require('../models/Chat');
    const Message = require('../models/Message');

    const updatedBookings = await Promise.all(bookings.map(async (b) => {
      // 1. Link to Group if missing
      if (b.type === 'split' && !b.groupId) {
        const d = new Date(b.date);
        d.setUTCHours(0,0,0,0);
        
        const group = await Group.findOne({ 
          guide: b.guide?._id || b.guide, 
          date: d 
        }).populate('members.user', 'name profileImage');
        
        if (group) {
          b.groupId = group;
          await Booking.findByIdAndUpdate(b._id, { groupId: group._id });
        }
      }

      // 2. Self-heal Group Chat if booking is accepted
      if (b.status === 'Accepted' && b.type === 'split' && b.groupId) {
        try {
          // b.groupId might be an ID or populated object
          const currentGroupId = b.groupId._id || b.groupId;
          let chat = await Chat.findOne({ isGroup: true, groupId: currentGroupId });
          
          if (!chat) {
              const group = await Group.findById(currentGroupId).populate('members.user');
              if (group) {
                  const participantIds = [
                      group.guide, 
                      ...group.members.map(m => m.user?._id || m.user)
                  ].filter(Boolean);

                  chat = await Chat.create({
                      participants: participantIds,
                      isGroup: true,
                      groupId: group._id,
                      status: 'active',
                      metadata: {
                          destinationName: group.destination,
                          groupTitle: `${group.destination} Group Trip`
                      }
                  });

                  const systemMsg = await Message.create({
                      chat: chat._id,
                      sender: group.guide,
                      content: `Hi everyone! Your group for ${group.destination} is now active. Feel free to coordinate your trip here!`
                  });
                  chat.lastMessage = systemMsg._id;
                  await chat.save();
              }
          }
        } catch (chatErr) {
          console.error("Self-heal chat error:", chatErr);
        }
      }

      return b;
    }));

    res.json({
      success: true,
      data: updatedBookings
    });
  } catch (error) {
    console.error("getMyBookings error", error);
    res.status(500).json({ success: false, error: "Failed to fetch your bookings" });
  }
};

// @desc    Get bookings for a guide
// @route   GET /api/bookings/guide-bookings
// @access  Private (Guide)
exports.getGuideBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guide: req.user.id })
      .populate("user", "name email profileImage")
      .populate({
        path: 'groupId',
        populate: {
          path: 'members.user',
          select: 'name profileImage'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error("getGuideBookings error", error);
    res.status(500).json({ success: false, error: "Failed to fetch guide bookings" });
  }
};

// @desc    Update booking status (Confirm/Decline)
// @route   PUT /api/bookings/:id/status
// @access  Private (Guide)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.guide.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    // Group Chat Logic: Triggered when guide accepts a split booking
    if (status === 'Accepted' && booking.type === 'split' && booking.groupId) {
        try {
            const Group = require('../models/Group');
            const Chat = require('../models/Chat');
            const Message = require('../models/Message');

            const group = await Group.findById(booking.groupId).populate('members.user');
            if (group) {
                // Find or create group chat
                let chat = await Chat.findOne({ 
                    isGroup: true, 
                    groupId: group._id 
                });

                const participantIds = [group.guide, ...group.members.map(m => m.user._id)];

                if (!chat) {
                    chat = await Chat.create({
                        participants: participantIds,
                        isGroup: true,
                        groupId: group._id,
                        status: 'active',
                        metadata: {
                            destinationName: group.destination,
                            groupTitle: `${group.destination} Group Trip`
                        }
                    });

                    // Add a system welcome message
                    const systemMsg = await Message.create({
                        chat: chat._id,
                        sender: group.guide, // Guide acts as host
                        content: `Hi everyone! Your group for ${group.destination} is now active. Feel free to coordinate your trip here!`
                    });
                    chat.lastMessage = systemMsg._id;
                    await chat.save();
                } else {
                    // Update participants in case new person joined
                    chat.participants = participantIds;
                    await chat.save();
                }
            }
        } catch (chatError) {
            console.error("Failed to setup group chat:", chatError);
            // Don't fail the whole request if chat fails
        }
    }

    // Notify the user
    await Notification.create({
      recipient: booking.user,
      sender: req.user.id,
      type: 'booking_update',
      title: `Booking ${status}`,
      message: `Your booking for ${booking.destinationName} has been ${status.toLowerCase()} by ${req.user.name}.`,
      relatedId: booking._id
    });

    res.json({
      success: true,
      data: booking,
      message: `Booking ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error("updateBookingStatus error", error);
    res.status(500).json({ success: false, error: "Failed to update booking status" });
  }
};

// @desc    Respond to a partner suggestion (accept/reject)
// @route   PUT /api/bookings/:id/respond-to-partner
// @access  Private (Traveler)
exports.respondToPartnerSuggestion = async (req, res) => {
  try {
    const { response } = req.body; // 'accept' or 'reject'
    
    if (!['accept', 'reject'].includes(response)) {
      return res.status(400).json({ success: false, error: "Response must be 'accept' or 'reject'" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (!booking.suggestedPartnerId) {
      return res.status(400).json({ success: false, error: "No partner suggestion for this booking" });
    }

    if (response === 'accept') {
      // Accept the partner suggestion
      booking.matchStatus = 'matched';
      booking.suggestedPartnerId = null; // Clear the suggestion
      await booking.save();

      // Notify the suggested partner that they've been matched
      await Notification.create({
        recipient: booking.suggestedPartnerId,
        sender: req.user.id,
        type: 'booking_update',
        title: 'Partner Match Confirmed',
        message: `Your partner has accepted the match for ${booking.destinationName}!`,
        relatedId: booking._id
      });

      res.json({
        success: true,
        data: booking,
        message: "Partner matched successfully!"
      });
    } else {
      // Reject the partner suggestion
      const rejectedPartnerId = booking.suggestedPartnerId;
      booking.matchStatus = 'searching'; // Go back to searching
      booking.suggestedPartnerId = null;
      await booking.save();

      // Notify the rejected partner
      await Notification.create({
        recipient: rejectedPartnerId,
        sender: req.user.id,
        type: 'booking_update',
        title: 'Partner Match Declined',
        message: `Your proposed match for ${booking.destinationName} was declined. We'll keep looking for the perfect partner!`,
        relatedId: booking._id
      });

      res.json({
        success: true,
        data: booking,
        message: "Partner suggestion rejected. Continue searching for a better match!"
      });
    }
  } catch (error) {
    console.error("respondToPartnerSuggestion error", error);
    res.status(500).json({ success: false, error: "Failed to respond to partner suggestion" });
  }
};

// @desc    Switch booking from split to private
// @route   PUT /api/bookings/:id/switch-to-private
// @access  Private (Traveler)
exports.switchToPrivateTour = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Only allow switching if still searching or has a pending suggestion
    if (!['searching', 'partner_found'].includes(booking.matchStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot switch to private: booking is already matched or cancelled" 
      });
    }

    booking.type = 'private';
    booking.matchStatus = 'private';
    booking.suggestedPartnerId = null;
    booking.searchStartTime = null;
    await booking.save();

    // Notify the guide about the change
    await Notification.create({
      recipient: booking.guide,
      sender: req.user.id,
      type: 'booking_update',
      title: 'Booking Type Changed',
      message: `${req.user.name} has switched their booking for ${booking.destinationName} to a private tour.`,
      relatedId: booking._id
    });

    res.json({
      success: true,
      data: booking,
      message: "Successfully switched to private tour"
    });
  } catch (error) {
    console.error("switchToPrivateTour error", error);
    res.status(500).json({ success: false, error: "Failed to switch to private tour" });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Traveler or Guide)
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body; // Optional cancellation reason
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Only traveler or guide can cancel
    const isTraveler = booking.user.toString() === req.user.id.toString();
    const isGuide = booking.guide.toString() === req.user.id.toString();
    
    if (!isTraveler && !isGuide) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Only cancel if booking isn't already cancelled or completed
    if (['Cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: "Booking is already cancelled" });
    }

    const previousStatus = booking.status;
    booking.status = 'Cancelled';
    booking.matchStatus = 'cancelled';
    booking.suggestedPartnerId = null;
    booking.searchStartTime = null;
    await booking.save();

    // Notify the other party
    const notificationRecipient = isTraveler ? booking.guide : booking.user;
    await Notification.create({
      recipient: notificationRecipient,
      sender: req.user.id,
      type: 'booking_update',
      title: 'Booking Cancelled',
      message: `The booking for ${booking.destinationName} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
      relatedId: booking._id
    });

    res.json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    console.error("cancelBooking error", error);
    res.status(500).json({ success: false, error: "Failed to cancel booking" });
  }
};

// @desc    User B (Requester) sends a join request to User A (Search originator)
// @route   POST /api/bookings/:id/request-join-group
// @access  Private (Any traveler searching for a partner)
exports.requestJoinGroup = async (req, res) => {
  try {
    const { targetBookingId } = req.body;
    const requesterBookingId = req.params.id;

    // Fetch both bookings
    const requesterBooking = await Booking.findById(requesterBookingId).populate('user', 'name profileImage');
    const targetBooking = await Booking.findById(targetBookingId).populate('user', 'name profileImage');

    if (!requesterBooking || !targetBooking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Verify requester is the booking owner
    if (requesterBooking.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized: You don't own this booking" });
    }

    // Validate conditions for joining
    if (requesterBooking.type !== 'split') {
      return res.status(400).json({ success: false, error: "Only split bookings can request to join groups" });
    }

    if (targetBooking.type !== 'split') {
      return res.status(400).json({ success: false, error: "Target booking is not a split booking" });
    }

    if (targetBooking.matchStatus !== 'searching') {
      return res.status(400).json({ success: false, error: "Target booking is not currently searching for a partner" });
    }

    if (requesterBooking.matchStatus !== 'searching') {
      return res.status(400).json({ success: false, error: "Your booking is not in searching state" });
    }

    // Check if same guide and date
    if (targetBooking.guide.toString() !== requesterBooking.guide.toString()) {
      return res.status(400).json({ success: false, error: "Different guides selected" });
    }

    if (new Date(targetBooking.date).getTime() !== new Date(requesterBooking.date).getTime()) {
      return res.status(400).json({ success: false, error: "Different dates selected" });
    }

    // Update Requester Booking (User B)
    requesterBooking.matchStatus = 'pending_approval';
    requesterBooking.pendingPartnerId = targetBooking.user._id;
    await requesterBooking.save();

    // Add to Target Booking's pending requests list
    targetBooking.pendingRequestsList = targetBooking.pendingRequestsList || [];
    
    // Check if already in pending list
    const alreadyPending = targetBooking.pendingRequestsList.some(
      r => r.userId.toString() === requesterBooking.user._id.toString()
    );

    if (!alreadyPending) {
      targetBooking.pendingRequestsList.push({
        userId: requesterBooking.user._id,
        requesterBookingId: requesterBooking._id,
        userName: requesterBooking.user.name,
        profileImage: requesterBooking.user.profileImage,
        requestedAt: new Date()
      });
      await targetBooking.save();
    }

    // Notify Target User (User A)
    await Notification.create({
      recipient: targetBooking.user._id,
      sender: requesterBooking.user._id,
      type: 'booking_request',
      title: '🔔 A Traveler Wants to Join Your Group!',
      message: `${requesterBooking.user.name} wants to join your ${requesterBooking.destinationName} trip on ${new Date(requesterBooking.date).toLocaleDateString()}. Review their profile and accept or decline.`,
      relatedId: targetBooking._id
    });

    res.status(200).json({
      success: true,
      data: {
        requesterBooking,
        message: "Join request sent! Waiting for user's response."
      }
    });
  } catch (error) {
    console.error("requestJoinGroup error:", error);
    res.status(500).json({ success: false, error: "Failed to send join request" });
  }
};

// @desc    User A (Search originator) accepts or rejects a join request from User B
// @route   PUT /api/bookings/:id/respond-to-join-request
// @access  Private (Only the searching traveler)
exports.respondToJoinRequest = async (req, res) => {
  try {
    const { requesterBookingId, response } = req.body;

    if (!['accept', 'reject'].includes(response)) {
      return res.status(400).json({ success: false, error: "Response must be 'accept' or 'reject'" });
    }

    const targetBooking = await Booking.findById(req.params.id).populate('user', 'name email profileImage');
    const requesterBooking = await Booking.findById(requesterBookingId).populate('user', 'name email profileImage');

    if (!targetBooking || !requesterBooking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Verify current user is the target booking owner
    if (targetBooking.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized: You can only respond to requests on your own booking" });
    }

    // Find the requester in pending list
    const requestIndex = targetBooking.pendingRequestsList.findIndex(
      r => r.userId.toString() === requesterBooking.user._id.toString()
    );

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, error: "Join request not found in pending list" });
    }

    if (response === 'accept') {
      // ACCEPT THE REQUEST - Two-way match finalized
      
      // Update Target Booking (User A)
      targetBooking.matchStatus = 'matched';
      targetBooking.acceptedPartnerId = requesterBooking.user._id;
      targetBooking.pendingRequestsList = []; // Clear all pending requests
      targetBooking.suggestedPartnerId = null;
      await targetBooking.save();

      // Update Requester Booking (User B)
      requesterBooking.matchStatus = 'matched';
      requesterBooking.acceptedPartnerId = targetBooking.user._id;
      requesterBooking.pendingPartnerId = null;
      requesterBooking.suggestedPartnerId = null;
      await requesterBooking.save();

      // Notify Requester about acceptance
      await Notification.create({
        recipient: requesterBooking.user._id,
        sender: targetBooking.user._id,
        type: 'booking_update',
        title: '✅ Join Request Accepted!',
        message: `${targetBooking.user.name} accepted your join request for ${requesterBooking.destinationName}! You're now travel partners. 🎉`,
        relatedId: targetBooking._id
      });

      // Notify Guide about the group
      await Notification.create({
        recipient: targetBooking.guide,
        sender: null,
        type: 'booking_update',
        title: 'Group Match Finalized',
        message: `${targetBooking.user.name} and ${requesterBooking.user.name} have matched for ${targetBooking.destinationName} on ${new Date(targetBooking.date).toLocaleDateString()}.`,
        relatedId: targetBooking._id
      });

      res.json({
        success: true,
        data: {
          targetBooking,
          requesterBooking
        },
        message: "Join request accepted! Partners matched successfully."
      });
    } else {
      // REJECT THE REQUEST
      
      // Remove from pending list
      targetBooking.pendingRequestsList.splice(requestIndex, 1);
      await targetBooking.save();

      // Revert Requester Booking back to searching
      requesterBooking.matchStatus = 'searching';
      requesterBooking.pendingPartnerId = null;
      await requesterBooking.save();

      // Notify Requester about rejection
      await Notification.create({
        recipient: requesterBooking.user._id,
        sender: targetBooking.user._id,
        type: 'booking_update',
        title: '❌ Join Request Declined',
        message: `${targetBooking.user.name} declined your join request for ${requesterBooking.destinationName}. Don't worry, keep searching - the right partner is out there!`,
        relatedId: targetBooking._id
      });

      res.json({
        success: true,
        data: {
          targetBooking,
          requesterBooking
        },
        message: "Join request rejected. Requester has been notified and returned to searching."
      });
    }
  } catch (error) {
    console.error("respondToJoinRequest error:", error);
    res.status(500).json({ success: false, error: "Failed to respond to join request" });
  }
};

// @desc    Get pending join requests for a booking
// @route   GET /api/bookings/:id/pending-requests
// @access  Private
exports.getPendingJoinRequests = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const pendingRequests = booking.pendingRequestsList || [];

    res.json({
      success: true,
      data: pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    console.error("getPendingJoinRequests error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch pending requests" });
  }
};
