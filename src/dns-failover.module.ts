import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsFailoverController } from './controllers/dns-failover.controller';
import { DnsFailoverService } from './services/dns-failover.service';
import { CloudflareService } from './services/cloudflare.service';
import { DnsRecord } from './entities/dns-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DnsRecord])
  ],
  controllers: [DnsFailoverController],
  providers: [
    DnsFailoverService,
    CloudflareService
  ],
  exports: [DnsFailoverService]
})
export class DnsFailoverModule {}