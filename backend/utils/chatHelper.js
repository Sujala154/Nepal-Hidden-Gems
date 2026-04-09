const Chat = require("../models/Chat");
const Message = require("../models/Message");

/**
 * Initialize or retrieve a chat based on booking type
 * For private bookings: Create/find 1-on-1 direct chat
 * For split bookings: Create/find group chat
 */
exports.initializeBookingChat = async (booking, options = {}) => {
  try {
    const { populateMembers = false } = options;

    // CASE 1: PRIVATE BOOKING - Create/find 1-on-1 chat
    if (booking.type === 'private') {
      const privateChat = await Chat.findOne({
        participants: { $all: [booking.user, booking.guide] },
        isGroup: false
      });

      if (privateChat) {
        // Chat already exists
        if (privateChat.status === 'pending') {
          // Activate it
          privateChat.status = 'active';
          await privateChat.save();
        }
        return privateChat;
      }

      // Create new 1-on-1 private chat
      const newPrivateChat = await Chat.create({
        participants: [booking.user, booking.guide],
        status: 'active',
        isGroup: false,
        metadata: {
          destinationName: booking.destinationName,
          bookingId: booking._id,
          groupTitle: `${booking.guideName} - ${booking.destinationName}`
        }
      });

      // Create welcome message
      const User = require("../models/User");
      const guide = await User.findById(booking.guide);

      const welcomeMsg = await Message.create({
        chat: newPrivateChat._id,
        sender: booking.guide,
        content: `Hi! I'm ${guide.name}, your guide for ${booking.destinationName}. Looking forward to your trip!`
      });

      newPrivateChat.lastMessage = welcomeMsg._id;
      await newPrivateChat.save();

      return newPrivateChat;
    }

    // CASE 2: SPLIT BOOKING - Create/find group chat
    if (booking.type === 'split') {
      if (!booking.groupId) {
        console.warn(`[CHAT_INIT] Split booking ${booking._id} has no groupId`);
        return null;
      }

      const Group = require("../models/Group");
      const group = await Group.findById(booking.groupId).populate('members.user');

      if (!group) {
        console.warn(`[CHAT_INIT] Group not found for booking ${booking._id}`);
        return null;
      }

      // Find existing group chat
      let groupChat = await Chat.findOne({
        isGroup: true,
        groupId: group._id
      });

      if (groupChat) {
        // Update participants in case new member joined
        const participantIds = [
          group.guide,
          ...group.members.map(m => m.user?._id || m.user)
        ].filter(Boolean);

        // Check if participants changed
        const currentParticipants = groupChat.participants.map(p => p.toString());
        const newParticipants = participantIds.map(p => p.toString());

        if (JSON.stringify(currentParticipants.sort()) !== JSON.stringify(newParticipants.sort())) {
          groupChat.participants = participantIds;
          await groupChat.save();
        }

        return groupChat;
      }

      // Create new group chat
      const participantIds = [
        group.guide,
        ...group.members.map(m => m.user?._id || m.user)
      ].filter(Boolean);

      const newGroupChat = await Chat.create({
        participants: participantIds,
        isGroup: true,
        groupId: group._id,
        status: 'active',
        metadata: {
          destinationName: group.destination,
          bookingId: booking._id,
          groupTitle: `${group.destination} Group Trip`
        }
      });

      // Create system welcome message
      const systemMsg = await Message.create({
        chat: newGroupChat._id,
        sender: group.guide,
        content: `Hi everyone! Your group for ${group.destination} is now active. Feel free to coordinate your trip here!`
      });

      newGroupChat.lastMessage = systemMsg._id;
      await newGroupChat.save();

      return newGroupChat;
    }

    return null;
  } catch (error) {
    console.error("initializeBookingChat error:", error);
    throw error;
  }
};

/**
 * Get or create a chat for a booking
 * Returns chat with appropriate population
 */
exports.getOrCreateBookingChat = async (bookingId) => {
  try {
    const Booking = require("../models/Booking");
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const chat = await exports.initializeBookingChat(booking);
    return chat;
  } catch (error) {
    console.error("getOrCreateBookingChat error:", error);
    throw error;
  }
};
