import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIP, IsNotEmpty } from 'class-validator';

export class CreateDnsRecordDto {
  @ApiProperty({ description: 'The unique id of Healthcheck in UptimeKuma' })
  @IsString()
  @IsNotEmpty()
  healthCheckId: number;

  @ApiProperty({ description: 'The domain name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The primary IPv4 address' })
  @IsIP()
  @IsNotEmpty()
  primaryIp4: string;

  @ApiProperty({ description: 'The backup IPv4 address' })
  @IsIP()
  @IsNotEmpty()
  backupIp4: string;

  @ApiProperty({ description: 'The primary IPv6 address' })
  @IsIP()
  @IsNotEmpty()
  primaryIp6: string;

  @ApiProperty({ description: 'The backup IPv6 address' })
  @IsIP()
  @IsNotEmpty()
  backupIp6: string;

  @ApiProperty({ description: 'The Cloudflare API token for this zone' })
  @IsString()
  @IsNotEmpty()
  apiToken: string;
}
