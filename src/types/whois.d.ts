// src/types/whois.d.ts
declare module 'whois' {
  export interface WhoisOptions {
    follow: number;
    timeout: number;
    verbose: boolean;
    bind: string;
    proxy: string;
    server: string;
  }

  export function lookup(
    addr: string,
    options: Partial<WhoisOptions>,
    callback: (err: Error | null, data: string) => void
  ): void;

  export function lookup(
    addr: string,
    callback: (err: Error | null, data: string) => void
  ): void;
}

export default whois;