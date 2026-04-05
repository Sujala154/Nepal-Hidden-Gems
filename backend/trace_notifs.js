const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Notification = require('./models/Notification');
const User = require('./models/User');

dotenv.config();

const trace = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for trace...');

        const lastNotifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('recipient', 'name email')
            .populate('sender', 'name email');

        console.log('\n--- LATEST 5 NOTIFICATIONS IN SYSTEM ---');
        lastNotifications.forEach((n, i) => {
            console.log(`${i+1}. [${n.type}] to ${n.recipient?.name || 'Unknown'} (${n.recipient?._id})`);
            console.log(`   Message: ${n.message}`);
            console.log(`   IsRead: ${n.isRead}`);
        });
        
        console.log('\n--- TARGET GUIDE CHECK ---');
        const manisha = await User.findOne({ name: /Manisha/i });
        if(manisha) {
            console.log(`Found Manisha Adhikari in DB with ID: ${manisha._id}`);
            const count = await Notification.countDocuments({ recipient: manisha._id });
            console.log(`Total notifications for her: ${count}`);
        } else {
            console.log('Manisha Adhikari NOT FOUND in database!');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

trace();
