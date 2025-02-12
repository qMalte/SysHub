import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnsRecord } from '../entities/dns-record.entity';
import { CloudflareService } from './cloudflare.service';
import { CreateDnsRecordDto } from '../dto/create-dns-record.dto';
import { UpdateDnsRecordDto } from '../dto/update-dns-record.dto';
import { UptimeKumaResponseDto } from 'src/dto/uptimekuma-response.dto';

@Injectable()
export class DnsFailoverService {
  constructor(
    @InjectRepository(DnsRecord)
    private dnsRecordRepository: Repository<DnsRecord>,
    private cloudflareService: CloudflareService,
  ) {}

  async create(createDnsRecordDto: CreateDnsRecordDto): Promise<DnsRecord> {
    const record = this.dnsRecordRepository.create(createDnsRecordDto);
    return await this.dnsRecordRepository.save(record);
  }

  async findAll(): Promise<DnsRecord[]> {
    return await this.dnsRecordRepository.find();
  }

  async findOne(id: number): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`DNS record with ID ${id} not found`);
    }
    return record;
  }

  async findByHealthcheck(id: number): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({ where: { healthCheckId: id } });
    if (!record) {
      throw new NotFoundException(`Policy with Healthcheck ID: ${id} not found`);
    }
    return record;
  }

  async update(id: number, updateDnsRecordDto: UpdateDnsRecordDto): Promise<DnsRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updateDnsRecordDto);
    return await this.dnsRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.dnsRecordRepository.remove(record);
  }

  async handleDowntime(id: number): Promise<void> {
    const record = await this.findOne(id);
    if (!record.isInFailover) {
      await this.cloudflareService.switchToBackup(record);
      record.isInFailover = true;
      await this.dnsRecordRepository.save(record);
    }
  }

  async handleRecovery(id: number): Promise<void> {
    const record = await this.findOne(id);
    if (record.isInFailover) {
      await this.cloudflareService.switchToPrimary(record);
      record.isInFailover = false;
      await this.dnsRecordRepository.save(record);
    }
  }

  async handleWebHook(webhookData: UptimeKumaResponseDto): Promise<void> {
    const record = await this.findByHealthcheck(webhookData.monitor.id);
    if (record == null) {
      throw new NotFoundException('Policy not found');
    }
    if (webhookData.monitor.active) {
      await this.handleRecovery(record.id);
    } else {
      await this.handleDowntime(record.id);
    }
  }

}