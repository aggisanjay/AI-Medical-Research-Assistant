require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Document = require('../models/Document');

const TARGET_USER_ID = 'user_3EuNUT04L3a43ndyka5stDPwtR9';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const convRes = await Conversation.updateMany(
    { $or: [{ userId: 'anonymous' }, { userId: { $exists: false } }, { userId: 'aggisanjay1234@gmail.com' }, { userId: 'aggisanjay12@gmail.com' }] },
    { $set: { userId: TARGET_USER_ID } }
  );
  console.log(`✅ Claimed ${convRes.modifiedCount} conversations for user: ${TARGET_USER_ID}`);

  const docRes = await Document.updateMany(
    { $or: [{ userId: 'anonymous' }, { userId: { $exists: false } }] },
    { $set: { userId: TARGET_USER_ID } }
  );
  console.log(`✅ Claimed ${docRes.modifiedCount} documents for user: ${TARGET_USER_ID}`);

  const totalUserConvs = await Conversation.countDocuments({ userId: TARGET_USER_ID });
  console.log(`📊 Total conversations now owned by active user: ${totalUserConvs}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
