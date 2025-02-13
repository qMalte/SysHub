// src/config/dns-servers.config.ts
import { DnsResolver } from '../enums/dns-resolver.enum';

export const DNS_SERVERS: Record<DnsResolver, string[]> = {
  [DnsResolver.CLOUDFLARE]: ['1.1.1.1', '1.0.0.1'],
  [DnsResolver.GOOGLE]: ['8.8.8.8', '8.8.4.4'],
  [DnsResolver.QUAD9]: ['9.9.9.9', '149.112.112.112'],
  [DnsResolver.ADGUARD]: ['94.140.14.140', '94.140.14.141'],
  [DnsResolver.CISCO]: ['208.67.222.222', '208.67.220.220']
};

export const DEFAULT_DNS_RESOLVER = DnsResolver.CLOUDFLARE;