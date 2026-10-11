// Minimal typing for the one Node API the token-contrast test uses (avoids adding @types/node).
declare module 'node:fs' {
  export function readFileSync(path: URL | string, encoding: 'utf8'): string;
}
