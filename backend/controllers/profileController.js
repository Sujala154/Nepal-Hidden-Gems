const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get current user's profile
exports.getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email');

        if (!profile) {
            profile = new Profile({ user: req.user.id });
            await profile.save();
            profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email');
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    const { fullName, bio, profilePicture, travelPreferences } = req.body;
    const profileFields = {};
    if (fullName) profileFields.fullName = fullName;
    if (bio) profileFields.bio = bio;
    if (profilePicture) profileFields.profilePicture = profilePicture;
    if (travelPreferences) profileFields.travelPreferences = travelPreferences;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).populate('user', 'email');

            return res.json({ success: true, data: profile });
        }

        profileFields.user = req.user.id;
        profile = new Profile(profileFields);
        await profile.save();
        profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email');

        res.json({ success: true, data: profile });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get user notifications
// @route   GET /api/profiles/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: notifications
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mark notifications as read
// @route   PUT /api/profiles/notifications/read
// @access  Private
exports.markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({
            success: true,
            message: 'Notifications marked as read'
        });
    } catch (err) {
        console.error('markNotificationsRead error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
