const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Destination = require('../models/Destination');
const User = require('../models/User');

async function audit() {
  await mongoose.connect(process.env.MONGO_URI);
  const approved = await Destination.find({ approved: true }).populate('createdBy', 'email');
  console.log(`--- Approved Destinations Audit (${approved.length}) ---`);
  
  approved.forEach(d => {
    const fields = [
      d.specialty ? 'Spec: OK' : 'Spec: MISSING',
      d.hospitality ? 'Hosp: OK' : 'Hosp: MISSING',
      d.accommodation ? 'Acco: OK' : 'Acco: MISSING',
      (d.multiple_images?.length > 0) ? 'Gallery: OK' : 'Gallery: NO',
      d.createdBy ? `Creator: ${d.createdBy.email}` : 'Creator: SEED/NONE'
    ];
    console.log(`- ${d.name.padEnd(25)} | ${fields.join(' | ')}`);
  });

  const all = await Destination.find({}).populate('createdBy', 'email');
  console.log(`\n--- All Destinations (${all.length}) ---`);
  all.forEach(d => {
    console.log(`- ${d.name.padEnd(25)} | Approved: ${d.approved ? 'YES' : 'NO '} | Creator: ${d.createdBy ? d.createdBy.email : 'SEED'}`);
  });

  mongoose.disconnect();
}
audit();
