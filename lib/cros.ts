import { NextRequest, NextResponse } from 'next/server';

export default function cors(
  req: NextRequest,
  res: NextResponse,
  allowedOrigins = ['*']
) {
  const origin = req.headers.get('origin');

  // Check if the origin is allowed
  if (
    allowedOrigins.includes('*') ||
    (origin && allowedOrigins.includes(origin))
  ) {
    res.headers.set('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && allowedOrigins.length > 0) {
    // If we have a specific list but this origin isn't in it
    res.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-api-key'
  );

  return res;
}
