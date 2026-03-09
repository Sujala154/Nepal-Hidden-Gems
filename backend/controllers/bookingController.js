const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { guideId, guideName, destinationName, date, amount, type, groupId } = req.body;

    const booking = await Booking.create({
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
    });

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
