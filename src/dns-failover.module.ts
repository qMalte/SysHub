import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsFailoverController } from './controllers/dns-failover.controller';
import { DnsFailoverService } from './services/dns-failover.service';
import { CloudflareService } from './services/cloudflare.service';
import { DnsRecord } from './entities/dns-record.entity';
import { DnsService } from './services/dns.service';
import { DnsController } from './controllers/dns.controller';
import { WhoisService } from './services/whois.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DnsRecord])
  ],
  controllers: [DnsFailoverController, DnsController],
  providers: [
    DnsFailoverService,
    CloudflareService,
    DnsService,
    WhoisService
  ],
  exports: [DnsFailoverService, DnsService, WhoisService]
})
export class DnsFailoverModule {}