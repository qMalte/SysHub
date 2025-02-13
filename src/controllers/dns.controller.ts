// src/controllers/dns.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { DnsService } from '../services/dns.service';
import { DnsResolver } from '../enums/dns-resolver.enum';
import { DnsLookupOutputDto } from '../dto/dns/dns-lookup-output.dto';

@ApiTags('DNS - Lookup')
@Controller('dns')
export class DnsController {
  constructor(private readonly dnsService: DnsService) {}

  @Get('lookup/:domain')
  @ApiOperation({ summary: 'Perform comprehensive DNS lookup for a domain' })
  @ApiQuery({
    name: 'resolver',
    enum: DnsResolver,
    required: false,
    description: 'DNS resolver to use for the query'
  })
  @ApiResponse({
    status: 200,
    description: 'DNS lookup completed successfully',
    type: DnsLookupOutputDto
  })
  @ApiResponse({ status: 400, description: 'Invalid domain name or resolver' })
  @ApiResponse({ status: 500, description: 'DNS lookup failed' })
  async lookupDomain(
    @Param('domain') domain: string,
    @Query('resolver') resolver?: DnsResolver
  ): Promise<DnsLookupOutputDto> {
    return this.dnsService.performDnsLookup(domain, resolver);
  }

  @Get('resolvers')
  @ApiOperation({ summary: 'Get list of available DNS resolvers' })
  @ApiResponse({
    status: 200,
    description: 'List of available DNS resolvers',
    type: [String]
  })
  getAvailableResolvers(): DnsResolver[] {
    return this.dnsService.getAvailableResolvers();
  }
}