import { encode, decode } from 'universal-base64url';

function encodeObject(obj: object): string {
  const str = JSON.stringify(obj);
  const encoded = encode(str);
  return encoded;
}

function decodeObject(encoded: string): object {
  const str = decode(encoded);
  const obj = JSON.parse(str);
  return obj;
}

export function getRandomDigits() {
  const array = '0123456789'.split('');
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function shuffle<T>(array: T[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function writeStateToQueryParms<T>(state: T, param: string = 's') {
  console.log(encodeObject({ [param]: state }));
  window.location.search = encodeObject({ [param]: state });
}

export function readStateFromQueryParams<T>(param: string = 's'): T | null {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedJson = urlParams.get(param);
  if (!encodedJson) {
    return null;
  }

  return decodeObject(encodedJson) as T;
}
