import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import * as dns from "dns/promises";
import { randomInt } from "crypto";
import { DnsLookupOutputDto } from '../dto/dns/dns-lookup-output.dto';
import { NameServerInfoDto } from '../dto/dns/name-server-info.dto';
import { DnsRecordsDto } from '../dto/dns/dns-records.dto';
import { WhoisDataDto } from '../dto/dns/whois-data.dto';
import { DnsRecordDto } from '../dto/dns/ns-record.dto';
import { DnsResolver } from '../enums/dns-resolver.enum';
import { DEFAULT_DNS_RESOLVER, DNS_SERVERS } from '../config/dns-servers.config';
import { WhoisService } from './whois.service';

@Injectable()
export class DnsService {
    private readonly logger = new Logger(DnsService.name);
    private readonly resolver: dns.Resolver;
    private readonly DEFAULT_TTL = 300; // 5 minutes default TTL
    private readonly DNS_TIMEOUT = 5000; // 5 seconds timeout for DNS queries
    private currentResolver: DnsResolver = DEFAULT_DNS_RESOLVER;

    constructor(private readonly whoisService: WhoisService) {
        this.resolver = new dns.Resolver({
            timeout: this.DNS_TIMEOUT
        });
        this.setDnsResolver(DEFAULT_DNS_RESOLVER);
    }

    /**
     * Checks if a delete token exists in the TXT records of a domain
     * @param fqdn Fully qualified domain name
     * @param deleteToken Token to check for
     * @returns boolean indicating if token was found
     */
    async checkDeleteToken(fqdn: string, deleteToken: string): Promise<boolean> {
        try {
            if (!this.isValidDomain(fqdn)) {
                throw new BadRequestException('Invalid domain name provided');
            }

            const records = await this.resolver.resolveTxt(fqdn);
            return records.some(record =>
              record.some(token => token === deleteToken)
            );
        } catch (error) {
            this.logger.error(`Error checking delete token for ${fqdn}: ${error.message}`);
            if (error instanceof BadRequestException) {
                throw error;
            }
            return false;
        }
    }

    /**
     * Retrieves all DNS records for a domain
     * @param domain Domain name
     * @returns DnsRecordsDto containing all record types
     * @private
     */
    private async getAllDnsRecords(domain: string): Promise<DnsRecordsDto> {
        const [aRecords, aaaaRecords, cnameRecords, txtRecords, mxRecords, nsRecords] =
          await Promise.allSettled([
              this.resolveARecords(domain),
              this.resolveAAAARecords(domain),
              this.resolveCNAMERecords(domain),
              this.resolveTXTRecords(domain),
              this.resolveMXRecords(domain),
              this.resolveNSRecords(domain)
          ]);

        return {
            a: this.extractSettledValue(aRecords),
            aaaa: this.extractSettledValue(aaaaRecords),
            cname: this.extractSettledValue(cnameRecords),
            txt: this.extractSettledValue(txtRecords),
            mx: this.extractSettledValue(mxRecords),
            ns: this.extractSettledValue(nsRecords)
        };
    }

    private async getWhoisData(domain: string): Promise<WhoisDataDto> {
        try {
            const whoisResult = await this.whoisService.lookup(domain);

            return {
                nameservers: this.normalizeNameservers(whoisResult.nameservers),
                registrar: whoisResult.registrar,
                creationDate: whoisResult.creationDate,
                expirationDate: whoisResult.expirationDate
            };
        } catch (error) {
            this.logger.error(`Error getting WHOIS data for ${domain}: ${error.message}`);
            // Fallback to NS records if WHOIS fails
            try {
                const nsRecords = await this.resolveNSRecords(domain);
                return {
                    nameservers: this.normalizeNameservers(
                      nsRecords.map(record => String(record.value))
                    ),
                    registrar: '',
                    creationDate: '',
                    expirationDate: ''
                };
            } catch (nsError) {
                this.logger.error(`NS record fallback failed for ${domain}: ${nsError.message}`);
                // Return empty result if both WHOIS and NS lookup fail
                return {
                    nameservers: [],
                    registrar: '',
                    creationDate: '',
                    expirationDate: ''
                };
            }
        }
    }

    /**
     * Resolves A records for a domain
     * @param domain Domain name
     * @returns Array of DnsRecordDto
     * @private
     */
    private async resolveARecords(domain: string): Promise<DnsRecordDto[]> {
        try {
            const records = await this.resolver.resolve4(domain, { ttl: true });
            return records.map(record => ({
                type: 'A',
                value: typeof record === 'string' ? record : record.address,
                ttl: typeof record === 'string' ? this.DEFAULT_TTL : record.ttl
            }));
        } catch (error) {
            this.logger.debug(`No A records found for ${domain}`);
            return [];
        }
    }

    /**
     * Resolves AAAA records for a domain
     * @param domain Domain name
     * @returns Array of DnsRecordDto
     * @private
     */
    private async resolveAAAARecords(domain: string): Promise<DnsRecordDto[]> {
        try {
            const records = await this.resolver.resolve6(domain, { ttl: true });
            return records.map(record => ({
                type: 'AAAA',
                value: typeof record === 'string' ? record : record.address,
                ttl: typeof record === 'string' ? this.DEFAULT_TTL : record.ttl
            }));
        } catch (error) {
            this.logger.debug(`No AAAA records found for ${domain}`);
            return [];
        }
    }

    /**
     * Resolves CNAME records for a domain
     * @param domain Domain name
     * @returns Array of DnsRecordDto
     * @private
     */
    private async resolveCNAMERecords(domain: string): Promise<DnsRecordDto[]> {
        try {
            const records = await this.resolver.resolveCname(domain);
            return records.map(record => ({
                type: 'CNAME',
                value: record,
                ttl: this.DEFAULT_TTL
            }));
        } catch (error) {
            this.logger.debug(`No CNAME records found for ${domain}`);
            return [];
        }
    }

    /**
     * Resolves TXT records for a domain
     * @param domain Domain name
     * @returns Array of DnsRecordDto
     * @private
     */
    private async resolveTXTRecords(domain: string): Promise<DnsRecordDto[]> {
        try {
            const records = await this.resolver.resolveTxt(domain);
            return records.map(record => ({
                type: 'TXT',
                value: record,
                ttl: this.DEFAULT_TTL
            }));
        } catch (error) {
            this.logger.debug(`No TXT records found for ${domain}`);
            return [];
        }
    }

    /**
     * Resolves MX records for a domain
     * @param domain Domain name
     * @returns Array of DnsRecordDto
     * @private
     */
    private async resolveMXRecords(domain: string): Promise<DnsRecordDto[]> {
        try {
            const records = await this.resolver.resolveMx(domain);
            return records.map(record => ({
                type: 'MX',
                value: `${record.priority} ${record.exchange}`,
                ttl: this.DEFAULT_TTL
            }));
        } catch (error) {
            this.logger.debug(`No MX records found for ${domain}`);
            return [];
        }
    }

    /**
     * Resolves NS records for a domain
     * @param domain Domain name
     * @returns Array of DnsRecordDto
     * @private
     */
    private async resolveNSRecords(domain: string): Promise<DnsRecordDto[]> {
        try {
            const records = await this.resolver.resolveNs(domain);
            return records.map(record => ({
                type: 'NS',
                value: record,
                ttl: this.DEFAULT_TTL
            }));
        } catch (error) {
            this.logger.debug(`No NS records found for ${domain}`);
            return [];
        }
    }

    /**
     * Selects a random nameserver from the provided list
     * @param nameservers Array of nameserver hostnames
     * @returns Selected nameserver hostname
     * @private
     */
    private selectRandomNameserver(nameservers: string[]): string {
        if (!nameservers.length) {
            return '8.8.8.8'; // Fallback to Google DNS
        }
        const index = randomInt(0, nameservers.length);
        return nameservers[index];
    }

    /**
     * Normalizes nameserver hostnames
     * @param nameservers Array of nameserver hostnames
     * @returns Normalized array of nameserver hostnames
     * @private
     */
    private normalizeNameservers(nameservers: string[]): string[] {
        return nameservers
          .map(ns => ns.toLowerCase().trim())
          .filter(ns => ns.length > 0)
          .filter((ns, index, self) => self.indexOf(ns) === index); // Remove duplicates
    }

    /**
     * Extracts the value from a PromiseSettledResult
     * @param result PromiseSettledResult
     * @returns Array of DnsRecordDto or empty array
     * @private
     */
    private extractSettledValue(result: PromiseSettledResult<DnsRecordDto[]>): DnsRecordDto[] {
        return result.status === 'fulfilled' ? result.value : [];
    }

    /**
     * Validates a domain name
     * @param domain Domain name to validate
     * @returns boolean indicating if domain is valid
     * @private
     */
    private isValidDomain(domain: string): boolean {
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    /**
     * Sets the DNS resolver to use for queries
     * @param resolver DnsResolver enum value
     * @private
     */
    private setDnsResolver(resolver: DnsResolver): void {
        try {
            const servers = DNS_SERVERS[resolver];
            if (!servers || servers.length === 0) {
                throw new Error(`No servers configured for resolver ${resolver}`);
            }
            this.resolver.setServers(servers);
            this.currentResolver = resolver;
            this.logger.log(`DNS resolver set to ${resolver}: ${servers.join(', ')}`);
        } catch (error) {
            this.logger.error(`Failed to set DNS resolver ${resolver}: ${error.message}`);
            // Fallback to default resolver if setting custom resolver fails
            if (resolver !== DEFAULT_DNS_RESOLVER) {
                this.logger.log(`Falling back to default resolver ${DEFAULT_DNS_RESOLVER}`);
                this.setDnsResolver(DEFAULT_DNS_RESOLVER);
            }
        }
    }

    /**
     * Performs a comprehensive DNS lookup including WHOIS data
     * @param domain Domain name to look up
     * @param resolver Optional DNS resolver to use
     * @returns DnsLookupOutputDto containing all DNS and WHOIS information
     */
    async performDnsLookup(
      domain: string,
      resolver: DnsResolver = DEFAULT_DNS_RESOLVER
    ): Promise<DnsLookupOutputDto> {
        try {
            if (!this.isValidDomain(domain)) {
                throw new BadRequestException('Invalid domain name provided');
            }

            // Set DNS resolver if different from current
            if (resolver !== this.currentResolver) {
                this.setDnsResolver(resolver);
            }

            // Get WHOIS data and nameservers
            const whoisData = await this.getWhoisData(domain);
            const selectedNs = this.selectRandomNameserver(whoisData.nameservers);

            const nameservers = whoisData.nameservers.map(ns => ({
                server: ns,
                isUsedForQuery: ns === selectedNs
            } as NameServerInfoDto));

            // Perform all DNS lookups in parallel
            const records = await this.getAllDnsRecords(domain);

            return {
                domain,
                nameservers,
                selectedNameserver: selectedNs,
                records,
                whoisData,
                usedResolver: this.currentResolver
            };
        } catch (error) {
            this.logger.error(`Error performing DNS lookup for ${domain}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gets the currently active DNS resolver
     * @returns Current DnsResolver enum value
     */
    getCurrentResolver(): DnsResolver {
        return this.currentResolver;
    }

    /**
     * Gets all available DNS resolvers
     * @returns Array of available DnsResolver enum values
     */
    getAvailableResolvers(): DnsResolver[] {
        return Object.values(DnsResolver);
    }
}