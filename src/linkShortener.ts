import { WEB_APP_URL } from './constants';

export async function getShortUrl(
  originalUrl: string,
): Promise<{ secureShortURL: string }> {
  const encodedState = originalUrl.split('#')[1];
  if (!encodedState) {
    return { secureShortURL: originalUrl };
  }

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encodedState }),
    });

    if (!response.ok) {
      throw new Error(`Shorten failed: ${response.status}`);
    }

    const { code } = await response.json();
    return { secureShortURL: `${WEB_APP_URL}/s/${code}` };
  } catch (error) {
    console.error('Short link creation failed:', error);
    return { secureShortURL: originalUrl };
  }
}

export async function resolveShortCode(
  code: string,
): Promise<string | null> {
  try {
    const response = await fetch(`/api/s/${code}`);

    if (!response.ok) {
      throw new Error(`Resolve failed: ${response.status}`);
    }

    const data = await response.json();
    return data.encoded_state ?? null;
  } catch (error) {
    console.error('Short code resolution failed:', error);
    return null;
  }
}
