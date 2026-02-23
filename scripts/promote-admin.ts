import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'cofounder-matching';

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log('Usage: npx tsx scripts/promote-admin.ts <email>');
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

  console.log(`Found user: ${user.name} (${user.email}), current role: ${user.role}`);

  await users.updateOne(
    { _id: user._id },
    { $set: { role: 'admin' } }
  );
  console.log(`✓ ${user.name} is now an admin.`);

  await mongoose.disconnect();
}

main().catch(console.error);
