const Profile = require('../models/Profile');
const User = require('../models/User');

// Get current user's profile
exports.getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email');

        if (!profile) {
            // Create empty profile if it doesn't exist yet for existing users
            // This ensures we always return a profile object
            profile = new Profile({ user: req.user.id });
            await profile.save();
            // Re-fetch to populate if needed (though user won't have changed)
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

    // Build profile object
    const profileFields = {};
    if (fullName) profileFields.fullName = fullName;
    if (bio) profileFields.bio = bio;
    if (profilePicture) profileFields.profilePicture = profilePicture;
    if (travelPreferences) profileFields.travelPreferences = travelPreferences;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).populate('user', 'email');

            return res.json({ success: true, data: profile });
        }

        // Create if not found (unexpected but safe)
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
