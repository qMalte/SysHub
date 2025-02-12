import { Injectable } from '@nestjs/common';
import Cloudflare from 'cloudflare';
import { DnsRecord } from '../entities/dns-record.entity';

@Injectable()
export class CloudflareService {
  private getClient(apiToken: string): Cloudflare {
    return new Cloudflare({
      apiToken
    });
  }

  async updateDnsRecord(record: DnsRecord, ip: string): Promise<void> {
    try {
      const client = this.getClient(record.apiToken);
      const tld = record.name.split('.').slice(-2).join('.');
      const zones = await client.zones.list();
      const zone = zones.result.find((zone) => zone.name.toLowerCase() === tld.toLowerCase());
      if (!zone) {
        throw new Error(`Zone ${tld} not found`);
      }
      const items = await client.dns.records.list({
        zone_id: zone.id,
      });
      const item = items.result.find((item) => item.name?.toLowerCase() === record.name.toLowerCase());
      if (!item) {
        throw new Error(`DNS record ${record.name} not found`);
      }
      await client.dns.records.edit(item.id, {
        zone_id: zone.id,
        content: ip,
      });
    } catch (error) {
      throw new Error(`Failed to update DNS record ${record.name}: ${error.message}`);
    }
  }

  async switchToBackup(record: DnsRecord): Promise<void> {
    if (record.backupIp4 != null) {
      await this.updateDnsRecord(record, record.backupIp4);
    }
    if (record.backupIp6 != null) {
      await this.updateDnsRecord(record, record.backupIp6);
    }
  }

  async switchToPrimary(record: DnsRecord): Promise<void> {
    if (record.primaryIp4 != null) {
      await this.updateDnsRecord(record, record.primaryIp4);
    }
    if (record.primaryIp6 != null) {
      await this.updateDnsRecord(record, record.primaryIp6);
    }
  }
}