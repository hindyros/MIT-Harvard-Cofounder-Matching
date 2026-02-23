import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'cofounder-matching';

const ADMIN_EMAIL = process.argv[2] || 'hindyrossignol@gmail.com';
const ADMIN_PASSWORD = process.argv[3] || 'Admin1234!';
const ADMIN_NAME = process.argv[4] || 'Hindy Rossignol';

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

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.collection('users').insertOne({
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    name: ADMIN_NAME,
    school: 'MIT',
    isVerified: true,
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

  console.log('Admin user created:');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     admin`);
  console.log(`  Approved: true`);

  await mongoose.disconnect();
  console.log('\nDone. Database is fresh with one admin user.');
}

main().catch(console.error);
