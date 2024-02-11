import 'whatwg-fetch';

const PUBLIC_KEY = 'pk_Bc0lILkQ7EYOu972';
const URL_SHORTENER_LINK = 'https://api.short.io/links/public';

export function getShortUrl(originalUrl: string) {
  const data = {
    domain: 'go.superbowl-squares.com',
    originalURL: `https://superbowl-squares.com/#${originalUrl.split('#')[1]}`,
    allowDuplicates: true,
  };

  return fetch(URL_SHORTENER_LINK, {
    method: 'post',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: PUBLIC_KEY,
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}
