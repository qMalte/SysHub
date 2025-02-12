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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { DnsFailoverService } from '../services/dns-failover.service';
import { CreateDnsRecordDto } from '../dto/create-dns-record.dto';
import { UpdateDnsRecordDto } from '../dto/update-dns-record.dto';
import { DnsRecord } from '../entities/dns-record.entity';
import { UptimeKumaResponseDto } from 'src/dto/uptimekuma-response.dto';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@ApiTags('DNS Failover')
@Controller('dns-failover')
export class DnsFailoverController {
  constructor(private readonly dnsFailoverService: DnsFailoverService) {}

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

  @Get()
  @ApiOperation({ summary: 'Get all DNS failover policies' })
  @ApiResponse({
    status: 200,
    description: 'Return all policies',
    type: [DnsRecord]
  })
  findAll(): Promise<DnsRecord[]> {
    return this.dnsFailoverService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific DNS failover policy' })
  @ApiParam({
    name: 'id',
    description: 'Policy ID',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Return the policy',
    type: DnsRecord
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found'
  })
  findOne(@Param('id') id: string): Promise<DnsRecord> {
    return this.dnsFailoverService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a DNS failover policy' })
  @ApiParam({
    name: 'id',
    description: 'Policy ID',
    type: 'number'
  })
  @ApiBody({ type: UpdateDnsRecordDto })
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
  ): Promise<DnsRecord> {
    return this.dnsFailoverService.update(+id, updateDnsRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a DNS failover policy' })
  @ApiParam({
    name: 'id',
    description: 'Policy ID',
    type: 'number'
  })
  @ApiResponse({
    status: 204,
    description: 'Policy deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found'
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.dnsFailoverService.remove(+id);
  }

  @Post(':id/hook')
  @ApiOperation({ summary: 'Process incomming WebHook of UptimeKuma' })
  @ApiResponse({
    status: 200,
    description: 'Process triggered successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Policy not found'
  })
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth('API-Key')
  handleRecovery(@Body() body: UptimeKumaResponseDto): Promise<void> {
    return this.dnsFailoverService.handleWebHook(body);
  }
}