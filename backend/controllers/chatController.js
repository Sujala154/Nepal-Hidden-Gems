const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send chat invite to a guide
// @route   POST /api/chats/invite
// @access  Private (Traveler)
exports.sendInvite = async (req, res) => {
    try {
        const { guideId } = req.body;
        const travelerId = req.user.id;

        if (guideId === travelerId.toString()) {
            return res.status(400).json({ success: false, error: "You cannot invite yourself" });
        }

        // Check if a chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [travelerId, guideId] }
        });

        if (chat) {
            return res.json({ success: true, message: "Chat already exists", chat });
        }

        // Create a pending chat
        chat = await Chat.create({
            participants: [travelerId, guideId],
            status: 'pending'
        });

        const sender = await User.findById(travelerId);

        // Create a notification for the guide
        await Notification.create({
            recipient: guideId,
            sender: travelerId,
            type: 'chat_invite',
            title: 'New Chat Invitation',
            message: `${sender.name} wants to start a conversation with you regarding a trip.`,
            relatedId: chat._id
        });

        res.status(201).json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error("sendInvite error", error);
        res.status(500).json({ success: false, error: "Failed to send invitation" });
    }
};

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        })
            .populate('participants', 'name email profileImage role')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: chats
        });
    } catch (error) {
        console.error("getChats error", error);
        res.status(500).json({ success: false, error: "Failed to fetch chats" });
    }
};

// @desc    Accept chat invite
// @route   PUT /api/chats/:id/accept
// @access  Private (Guide)
exports.acceptInvite = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({ success: false, error: "Chat not found" });
        }

        if (!chat.participants.includes(req.user.id.toString())) {
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        chat.status = 'active';
        await chat.save();

        // Mark notification as accepted
        await Notification.updateMany(
            { relatedId: chat._id, recipient: req.user.id },
            { status: 'accepted', isRead: true }
        );

        res.json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error("acceptInvite error", error);
        res.status(500).json({ success: false, error: "Failed to accept invite" });
    }
};

// @desc    Decline chat invite
// @route   PUT /api/chats/:id/decline
// @access  Private (Guide)
exports.declineInvite = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({ success: false, error: "Chat not found" });
        }

        if (!chat.participants.includes(req.user.id.toString())) {
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        chat.status = 'archived';
        await chat.save();

        // Mark notification as declined
        await Notification.updateMany(
            { relatedId: chat._id, recipient: req.user.id },
            { status: 'declined', isRead: true }
        );

        res.json({
            success: true,
            message: "Invitation declined"
        });
    } catch (error) {
        console.error("declineInvite error", error);
        res.status(500).json({ success: false, error: "Failed to decline invite" });
    }
};

// @desc    Get user's notifications
// @route   GET /api/chats/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id,
            isRead: false
        })
            .populate('sender', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("getNotifications error", error);
        res.status(500).json({ success: false, error: "Failed to fetch notifications" });
    }
};
// @desc    Get messages for a chat
// @route   GET /api/chats/:id/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            chat: req.params.id
        })
            .populate('sender', 'name profileImage role')
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error("getMessages error", error);
        res.status(500).json({ success: false, error: "Failed to fetch messages" });
    }
};

// @desc    Send a message in a chat
// @route   POST /api/chats/:id/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const chatId = req.params.id;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, error: "Chat not found" });
        }

        if (!chat.participants.includes(req.user.id.toString())) {
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        if (chat.status !== 'active') {
            return res.status(400).json({ success: false, error: "Chat is not active" });
        }

        const message = await Message.create({
            chat: chatId,
            sender: req.user.id,
            content
        });

        chat.lastMessage = message._id;
        await chat.save();

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage role');
        
        // Emit via Socket.io
        const io = req.app.get('io');
        io.to(chatId).emit('receive_message', populatedMessage);

        res.status(201).json({
            success: true,
            data: populatedMessage
        });
    } catch (error) {
        console.error("sendMessage error", error);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
};
// @desc    Delete a chat
// @route   DELETE /api/chats/:id
// @access  Private
exports.deleteChat = async (req, res) => {
    try {
        const chatId = String(req.params.id).trim();
        console.log(`[DELETE_CHAT] Attempting to delete chat ID: ${chatId}`);

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            console.error(`[DELETE_CHAT] Invalid ID format: ${chatId}`);
            return res.status(400).json({ success: false, error: "Invalid Chat ID format" });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            console.warn(`[DELETE_CHAT] Chat not found in DB: ${chatId}`);
            return res.status(404).json({ success: false, error: "Chat could not be found" });
        }

        // Check if user is a participant
        if (!chat.participants.some(p => p.toString() === req.user.id.toString())) {
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        // Delete all messages in this chat
        await Message.deleteMany({ chat: req.params.id });
        
        // Delete notifications related to this chat
        await Notification.deleteMany({ relatedId: req.params.id });

        // Delete the chat
        await Chat.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Chat deleted successfully"
        });
    } catch (error) {
        console.error("deleteChat error", error);
        res.status(500).json({ success: false, error: "Failed to delete chat" });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/chats/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error("deleteNotification error", error);
        res.status(500).json({ success: false, error: "Failed to delete notification" });
    }
};
