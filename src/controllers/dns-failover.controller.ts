import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  Query,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity
} from '@nestjs/swagger';
import { DnsFailoverService } from '../services/dns-failover.service';
import { CreateDnsRecordDto } from '../dto/create-dns-record.dto';
import { UpdateDnsRecordDto } from '../dto/update-dns-record.dto';
import { DnsRecord } from '../entities/dns-record.entity';
import { UptimeKumaResponseDto } from 'src/dto/uptimekuma-response.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { DnsService } from 'src/services/dns.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthHeader } from 'src/decorator/auth-header.decorator';
import * as bcrypt from 'bcrypt';

@ApiTags('DNS Failover')
@Controller('dns-failover')
export class DnsFailoverController {
  constructor(
    private readonly dnsFailoverService: DnsFailoverService,
    private readonly dnsService: DnsService,
    @InjectRepository(DnsRecord)
    private dnsRecordRepository: Repository<DnsRecord>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search a policy by name' })
  @ApiSecurity('Auth')
  @ApiResponse({
    status: 201,
    description: 'Policy found successfully',
    type: DnsRecord
  })
  async get(@Query('domainName') name: string, @AuthHeader() key: string) {
    const policy = await this.dnsFailoverService.findByDomain(name);
    if (await bcrypt.compare(key, policy.secret)) {
      return policy;
    }
    throw new UnauthorizedException();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new DNS failover policy' })
  @ApiBody({ type: CreateDnsRecordDto })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
    type: DnsRecord
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  create(@Body() createDnsRecordDto: CreateDnsRecordDto): Promise<DnsRecord> {
    return this.dnsFailoverService.create(createDnsRecordDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a DNS failover policy' })
  @ApiParam({
    name: 'id',
    description: 'Policy ID',
    type: 'number'
  })
  @ApiBody({ type: UpdateDnsRecordDto })
  @ApiSecurity('Auth')
  @ApiResponse({
    status: 200,
    description: 'Policy updated successfully',
    type: DnsRecord
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  update(
    @Param('id') id: string,
    @Body() updateDnsRecordDto: UpdateDnsRecordDto,
    @AuthHeader() key: string
  ): Promise<DnsRecord> {
    return this.dnsFailoverService.update(+id, updateDnsRecordDto, key);
  }

  @Get(':id/delete-token')
  @ApiOperation({ summary: 'Request DNS-Record for init Deletion of Policy' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Policy ID',
    type: 'number'
  })
  @ApiResponse({
    status: 204,
    type: DnsRecord,
    description: 'Delete token generated successfully'
  })
  async getRemovalToken(@Param('policyId') policyId: string) {
    if (policyId == null || +policyId <= 0) {
      throw new UnauthorizedException("Invalid policy ID");
    }

    const dnsRecord = await this.dnsRecordRepository.findOne({
      where: {
        id: +policyId
      }
    });

    if (dnsRecord == null) {
      throw new NotFoundException("Policy not found");
    }

    dnsRecord.deleteToken = Math.random().toString(36).substring(2);
    await this.dnsRecordRepository.save(dnsRecord);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a DNS failover policy' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Policy ID',
    type: 'number'
  })
  @ApiResponse({
    status: 204,
    description: 'Policy deleted successfully'
  })
  async remove(@Param('policyId') policyId: string) {
    if (policyId == null || +policyId <= 0) {
      throw new UnauthorizedException("Invalid policy ID");
    }

    const dnsRecord = await this.dnsRecordRepository.findOne({
      where: {
        id: +policyId
      }
    });

    if (dnsRecord == null) {
      throw new NotFoundException("Policy not found");
    }

    if (dnsRecord.deleteToken == null) {
      throw new UnauthorizedException("Delete token not generated");
    }

    if (await this.dnsService.checkDeleteToken(dnsRecord.name, dnsRecord.deleteToken)) {
      await this.dnsFailoverService.handleRecovery(dnsRecord.id);
      await this.dnsRecordRepository.remove(dnsRecord);
    } else {
      throw new UnauthorizedException("Invalid delete token");
    }
  }

  @Post(':id/hook')
  @ApiOperation({ summary: 'Process incomming WebHook of UptimeKuma' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Policy ID',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Process triggered successfully'
  })
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('Auth')
  handleRecovery(@Body() body: UptimeKumaResponseDto): Promise<void> {
    return this.dnsFailoverService.handleWebHook(body);
  }
}