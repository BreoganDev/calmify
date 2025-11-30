import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Webhook stub for Meta (verify token + log events)
export async function GET(request : Request) {
  const url = new URL(request.url);
  const hubMode = url.searchParams.get('hub.mode');
  const hubToken = url.searchParams.get('hub.verify_token');
  const hubChallenge = url.searchParams.get('hub.challenge');

  if (hubMode === 'subscribe' && hubToken === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(hubChallenge || '', { status: 200 });
  }
  return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
}

export async function POST(request : Request) {
  try {
    const body = await request.json();
    await prisma.trackingEvent.create({
      data: {
        type: 'LOGIN', // placeholder
        metadata: body,
      },
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}
