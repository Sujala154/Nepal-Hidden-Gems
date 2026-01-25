const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ name: /Shyam/ });
  console.log('User Found:', JSON.stringify(user, null, 2));
  process.exit(0);
}
check();
