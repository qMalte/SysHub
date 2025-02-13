import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('dns_records')
export class DnsRecord {
  @ApiProperty({ description: 'The unique identifier of the DNS record' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The unique identifier of HealthCheck' })
  healthCheckId: number;
  
  @ApiProperty({ description: 'The domain name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The primary IPv4 address' })
  @Column()
  primaryIp4: string;

  @ApiProperty({ description: 'The backup IPv4 address' })
  @Column()
  backupIp4: string;

  @ApiProperty({ description: 'The primary IPv6 address' })
  @Column()
  primaryIp6: string;

  @ApiProperty({ description: 'The backup IPv6 address' })
  @Column()
  backupIp6: string;

  @ApiProperty({ description: 'The Cloudflare API token for this zone' })
  @Exclude()
  @Column({ type: 'text', name: 'api_token' })
  apiToken: string;

  @ApiProperty({ description: 'The Secret-Key to allow Edit of Policy' })
  @Exclude()
  @Column({ type: 'text', name: 'secret' })
  secret: string;

  @ApiProperty({ description: 'The Token to init a deletion Request' })
  @Column({ type: 'text', name: 'delete_token', default: null })
  deleteToken: string;

  @ApiProperty({ description: 'Whether the domain is currently in failover mode' })
  @Column({ default: false })
  isInFailover: boolean;

  @ApiProperty({ description: 'When the record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}