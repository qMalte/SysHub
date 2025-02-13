// src/dto/dns-lookup-output.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { DnsRecordsDto } from './dns-records.dto';
import { NameServerInfoDto } from './name-server-info.dto';
import { WhoisDataDto } from './whois-data.dto';
import { DnsResolver } from '../../enums/dns-resolver.enum';

export class DnsLookupOutputDto {
  @ApiProperty({
    description: 'Domain name that was queried',
    example: 'example.com'
  })
  domain: string;

  @ApiProperty({
    type: [NameServerInfoDto],
    description: 'List of nameservers with query status'
  })
  nameservers: NameServerInfoDto[];

  @ApiProperty({
    description: 'Nameserver used for the DNS queries',
    example: 'ns1.example.com'
  })
  selectedNameserver: string;

  @ApiProperty({
    type: DnsRecordsDto,
    description: 'DNS records grouped by type'
  })
  records: DnsRecordsDto;

  @ApiProperty({
    type: WhoisDataDto,
    description: 'WHOIS information for the domain'
  })
  whoisData: WhoisDataDto;

  @ApiProperty({
    enum: DnsResolver,
    description: 'DNS resolver used for the query',
    example: DnsResolver.CLOUDFLARE
  })
  usedResolver: DnsResolver;
}