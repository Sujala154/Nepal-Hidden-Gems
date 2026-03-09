const Group = require('../models/Group');
const Booking = require('../models/Booking');

// Helper to normalize date to UTC Midnight
const normalizeDate = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// @desc    Get available groups for a guide on a specific date
// @route   GET /api/groups/available
// @access  Private
exports.getAvailableGroups = async (req, res) => {
    try {
        const { guideId, date } = req.query;

        if (!guideId || !date) {
            return res.status(400).json({ success: false, error: "Guide and Date are required" });
        }

        const normalizedDate = normalizeDate(date);

        const groups = await Group.find({
            guide: guideId,
            date: normalizedDate,
            status: 'open'
        }).populate('members.user', 'name profileImage');

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error("getAvailableGroups error", error);
        res.status(500).json({ success: false, error: "Failed to fetch available groups" });
    }
};

// @desc    Join an existing group
// @route   POST /api/groups/:id/join
// @access  Private
exports.joinGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        // Check if already a member
        const isMember = group.members.some(m => m.user.toString() === userId);
        if (isMember) {
            return res.json({ success: true, data: group, message: "Already in group" });
        }

        if (group.status !== 'open') {
            return res.status(400).json({ success: false, error: "This group is no longer accepting members" });
        }

        // Add member
        group.members.push({ user: userId });
        
        // Update status if full
        if (group.members.length >= group.maxMembers) {
            group.status = 'full';
        }

        await group.save();

        // Emit Socket.io event
        const io = req.app.get('io');
        if (io) {
            io.emit('notification', {
                type: 'group_join',
                message: `Someone joined your group for ${group.destination}!`,
                userId: group.creator,
                groupId: group._id
            });
        }

        res.json({
            success: true,
            data: group
        });
    } catch (error) {
        console.error("joinGroup error", error);
        res.status(500).json({ success: false, error: "Failed to join group" });
    }
};

// @desc    Create or Join a group (Idempotent)
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
    try {
        const { guideId, date, destination, estimatedCost } = req.body;
        const userId = req.user.id;

        const normalizedDate = normalizeDate(date);

        // 1. Check if group already exists (Idempotency)
        let group = await Group.findOne({ 
            guide: guideId, 
            date: normalizedDate 
        });

        if (group) {
            // If it exists, just join the user to it instead of erroring
            const isMember = group.members.some(m => m.user.toString() === userId);
            if (!isMember && group.status === 'open') {
                group.members.push({ user: userId });
                if (group.members.length >= group.maxMembers) {
                    group.status = 'full';
                }
                await group.save();
            }
            return res.status(200).json({
                success: true,
                data: group,
                message: "Joined existing group"
            });
        }

        // 2. Otherwise create new
        group = await Group.create({
            guide: guideId,
            date: normalizedDate,
            destination,
            estimatedCost,
            maxMembers: 2, // Split & Save is 2 people
            creator: userId,
            members: [{ user: userId }]
        });

        res.status(201).json({
            success: true,
            data: group
        });
    } catch (error) {
        console.error("createGroup error", error);
        res.status(500).json({ success: false, error: "Failed to process group" });
    }
};
