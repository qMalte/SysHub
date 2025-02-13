import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnsRecord } from '../entities/dns-record.entity';
import { CloudflareService } from './cloudflare.service';
import { CreateDnsRecordDto } from '../dto/create-dns-record.dto';
import { UpdateDnsRecordDto } from '../dto/update-dns-record.dto';
import { UptimeKumaResponseDto } from 'src/dto/uptimekuma-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DnsFailoverService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(DnsRecord)
    private readonly dnsRecordRepository: Repository<DnsRecord>,
    private readonly cloudflareService: CloudflareService,
  ) {}

  async create(createDnsRecordDto: CreateDnsRecordDto): Promise<DnsRecord> {
    await this.validateDomainNameUniqueness(createDnsRecordDto.name);

    const hashedSecret = await this.hashSecret(createDnsRecordDto.secret);
    const recordToCreate = {
      ...createDnsRecordDto,
      secret: hashedSecret
    };

    const record = this.dnsRecordRepository.create(recordToCreate);
    return this.dnsRecordRepository.save(record);
  }

  async findByDomain(domainName: string): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({
      where: { name: domainName }
    });

    if (!record) {
      throw new NotFoundException(`Policy for Domain Name: ${domainName} not found`);
    }

    return record;
  }

  async findOne(id: number): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`DNS record with ID ${id} not found`);
    }

    return record;
  }

  async findByHealthcheck(healthcheckId: number): Promise<DnsRecord> {
    const record = await this.dnsRecordRepository.findOne({
      where: { healthCheckId: healthcheckId }
    });

    if (!record) {
      throw new NotFoundException(`Policy with Healthcheck ID: ${healthcheckId} not found`);
    }

    return record;
  }

  async update(
    id: number,
    updateDnsRecordDto: UpdateDnsRecordDto,
    secretKey: string
  ): Promise<DnsRecord> {
    const record = await this.findOne(id);
    await this.validateSecretKey(secretKey, record.secret);

    const updatedRecord = {
      ...updateDnsRecordDto,
      secret: updateDnsRecordDto.secret
        ? await this.hashSecret(updateDnsRecordDto.secret)
        : record.secret
    };

    Object.assign(record, updatedRecord);
    return this.dnsRecordRepository.save(record);
  }

  async handleDowntime(id: number): Promise<void> {
    const record = await this.findOne(id);

    if (!record.isInFailover) {
      await this.switchToFailoverMode(record);
    }
  }

  async handleRecovery(id: number): Promise<void> {
    const record = await this.findOne(id);

    if (record.isInFailover) {
      await this.switchToPrimaryMode(record);
    }
  }

  async handleWebHook(webhookData: UptimeKumaResponseDto): Promise<void> {
    const record = await this.findByHealthcheck(webhookData.monitor.id);

    if (!record) {
      throw new NotFoundException('Policy not found');
    }

    await this.handleMonitorStatus(record.id, webhookData.monitor.active);
  }

  private async validateDomainNameUniqueness(domainName: string): Promise<void> {
    const exists = await this.dnsRecordRepository.exists({
      where: { name: domainName }
    });

    if (exists) {
      throw new NotFoundException(
        `Policy for Domain Name: ${domainName} already exists`
      );
    }
  }

  private async validateSecretKey(providedKey: string, storedHash: string): Promise<void> {
    const isValid = await bcrypt.compare(providedKey, storedHash);

    if (!isValid) {
      throw new ForbiddenException('Invalid secret key');
    }
  }

  private async hashSecret(secret: string): Promise<string> {
    return bcrypt.hash(secret, this.SALT_ROUNDS);
  }

  private async switchToFailoverMode(record: DnsRecord): Promise<void> {
    await this.cloudflareService.switchToBackup(record);
    await this.updateFailoverStatus(record, true);
  }

  private async switchToPrimaryMode(record: DnsRecord): Promise<void> {
    await this.cloudflareService.switchToPrimary(record);
    await this.updateFailoverStatus(record, false);
  }

  private async updateFailoverStatus(record: DnsRecord, isInFailover: boolean): Promise<void> {
    record.isInFailover = isInFailover;
    await this.dnsRecordRepository.save(record);
  }

  private async handleMonitorStatus(recordId: number, isActive: boolean): Promise<void> {
    if (isActive) {
      await this.handleRecovery(recordId);
    } else {
      await this.handleDowntime(recordId);
    }
  }
}