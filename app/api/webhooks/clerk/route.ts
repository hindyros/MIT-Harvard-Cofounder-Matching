import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { validateEmail } from '@/lib/utils/auth';

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
  };
  type: string;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const { id: clerkUserId, email_addresses, primary_email_address_id, first_name, last_name } = event.data;

    const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id);
    if (!primaryEmail) {
      return NextResponse.json({ error: 'No primary email' }, { status: 400 });
    }

    const email = primaryEmail.email_address.toLowerCase();
    const name = [first_name, last_name].filter(Boolean).join(' ') || email.split('@')[0];
    const { valid, school } = validateEmail(email);

    if (!valid) {
      console.warn(`Clerk user ${clerkUserId} has non-MIT/Harvard email: ${email}`);
      return NextResponse.json({ received: true, skipped: true });
    }

    await connectDB();

    const existing = await User.findOne({
      $or: [{ clerkUserId }, { email }],
    });

    if (existing) {
      if (!existing.clerkUserId) {
        existing.clerkUserId = clerkUserId;
      }
      existing.name = name;
      existing.email = email;
      await existing.save();
    } else {
      await User.create({
        clerkUserId,
        email,
        name,
        school,
        isApproved: false,
        role: 'user',
      });
    }
  }

  if (event.type === 'user.deleted') {
    const { id: clerkUserId } = event.data;
    await connectDB();
    await User.findOneAndDelete({ clerkUserId });
  }

  return NextResponse.json({ received: true });
}
