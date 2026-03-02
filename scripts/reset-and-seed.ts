import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'cofounder-matching';

const ADMIN_EMAIL = process.argv[2] || 'hindyrossignol@gmail.com';
const ADMIN_NAME = process.argv[3] || 'Hindy Rossignol';

async function main() {
  console.log(`Connecting to ${MONGODB_DB}...`);
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  const db = mongoose.connection.db!;

  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
    console.log(`  Cleared: ${col.name}`);
  }
  console.log('\nAll collections wiped.\n');

  await db.collection('users').insertOne({
    email: ADMIN_EMAIL.toLowerCase(),
    name: ADMIN_NAME,
    school: 'MIT',
    isApproved: true,
    role: 'admin',
    profile: {
      headline: 'Platform Admin',
      bio: '',
      skills: [],
      interests: [],
      lookingFor: [],
    },
    lastActive: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Admin user created (link to Clerk by signing in with this email):');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Role:     admin`);
  console.log(`  Approved: true`);

  await mongoose.disconnect();
  console.log('\nDone. Database is fresh with one admin user.');
}

main().catch(console.error);
