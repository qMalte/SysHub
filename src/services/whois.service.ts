// src/services/whois.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as whois from 'whois';
import { promisify } from 'util';

@Injectable()
export class WhoisService {
  private readonly logger = new Logger(WhoisService.name);
  private readonly whoisLookup: (domain: string) => Promise<string>;

  constructor() {
    this.whoisLookup = promisify(whois.lookup);
  }

  async lookup(domain: string): Promise<WhoisResult> {
    try {
      const rawData = await this.whoisLookup(domain);
      return this.parseWhoisData(rawData);
    } catch (error) {
      this.logger.error(`WHOIS lookup failed for ${domain}: ${error.message}`);
      throw error;
    }
  }

  private parseWhoisData(rawData: string): WhoisResult {
    const result: WhoisResult = {
      nameservers: [],
      registrar: '',
      creationDate: '',
      expirationDate: ''
    };

    if (!rawData) return result;

    const lines = rawData.split('\n');

    for (const line of lines) {
      const [key, ...values] = line.split(':').map(part => part.trim());
      const value = values.join(':').trim();

      if (!key || !value) continue;

      const lowerKey = key.toLowerCase();

      // Name Servers
      if (lowerKey.includes('name server')) {
        const ns = value.toLowerCase();
        if (ns && !result.nameservers.includes(ns)) {
          result.nameservers.push(ns);
        }
      }
      // Registrar
      else if (lowerKey.includes('registrar') && !result.registrar) {
        result.registrar = value;
      }
      // Creation Date
      else if (lowerKey.includes('creation date') && !result.creationDate) {
        result.creationDate = this.normalizeDate(value);
      }
      // Expiration Date
      else if ((lowerKey.includes('expiry date') || lowerKey.includes('expiration date')) && !result.expirationDate) {
        result.expirationDate = this.normalizeDate(value);
      }
    }

    return result;
  }

  private normalizeDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString();
    } catch {
      return dateStr;
    }
  }
}

export interface WhoisResult {
  nameservers: string[];
  registrar: string;
  creationDate: string;
  expirationDate: string;
}