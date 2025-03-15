import { NextRequest } from 'next/server';

export default function cors(req: NextRequest, allowedOrigins = ['*']) {
  const origin = req.headers.get('origin');

  // Set CORS headers
  const headers = new Headers();

  // Check if the origin is allowed
  if (
    allowedOrigins.includes('*') ||
    (origin && allowedOrigins.includes(origin))
  ) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && allowedOrigins.length > 0) {
    // If we have a specific list but this origin isn't in it
    headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-api-key,accept'
  );

  return headers;
}
