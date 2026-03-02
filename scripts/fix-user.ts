import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'cofounder-matching';

async function main() {
  const action = process.argv[2]; // 'approve' or 'delete'
  const email = process.argv[3];

  if (!action || !email) {
    console.log('Usage: npx tsx scripts/fix-user.ts <approve|delete> <email>');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  const db = mongoose.connection.db!;
  const users = db.collection('users');

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user.email}), approved: ${user.isApproved}`);

  if (action === 'approve') {
    await users.updateOne(
      { _id: user._id },
      { $set: { isApproved: true } }
    );
    console.log('User marked as approved.');
  } else if (action === 'delete') {
    await users.deleteOne({ _id: user._id });
    console.log('User deleted. They can re-register via Clerk.');
  } else {
    console.log('Unknown action. Use "approve" or "delete".');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
