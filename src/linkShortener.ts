import { SUPABASE_URL, SUPABASE_ANON_KEY, WEB_APP_URL } from './constants';

const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getShortUrl(
  originalUrl: string,
): Promise<{ secureShortURL: string }> {
  const encodedState = originalUrl.split('#')[1];
  if (!encodedState) {
    return { secureShortURL: originalUrl };
  }

  const code = generateCode();
  try {
    const response = await fetch(`${SUPABASE_REST}/short_links`, {
      method: 'POST',
      headers: { ...HEADERS, Prefer: 'return=representation' },
      body: JSON.stringify({ code, encoded_state: encodedState }),
    });

    if (!response.ok) {
      throw new Error(`Supabase insert failed: ${response.status}`);
    }

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
    const response = await fetch(
      `${SUPABASE_REST}/short_links?code=eq.${code}&select=encoded_state`,
      { headers: HEADERS },
    );

    if (!response.ok) {
      throw new Error(`Supabase lookup failed: ${response.status}`);
    }

    const rows = await response.json();
    if (rows.length > 0) {
      return rows[0].encoded_state;
    }
    return null;
  } catch (error) {
    console.error('Short code resolution failed:', error);
    return null;
  }
}
