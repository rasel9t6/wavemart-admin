export function verifyApiKey(authHeader: string | null): boolean {
  console.log('Received authHeader:', authHeader);

  if (!authHeader) return false;

  const apiKey = process.env.STORE_API_KEY;
  console.log('Expected API Key:', apiKey);

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    console.log('Invalid format:', { type, token });
    return false;
  }

  console.log('Received token:', token);

  return token === apiKey;
}
