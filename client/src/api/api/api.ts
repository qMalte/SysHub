export * from './dNSFailover.service';
import { DNSFailoverService } from './dNSFailover.service';
export * from './dNSLookup.service';
import { DNSLookupService } from './dNSLookup.service';
export * from './info.service';
import { InfoService } from './info.service';
export const APIS = [DNSFailoverService, DNSLookupService, InfoService];
