import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UptimeKumaTagDto } from './uptimekuma-tag.dto';

export class UptimeKumaMonitorDto {
  @ApiProperty({ description: 'Monitor ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Monitor name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Monitor description' })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({ description: 'Path name' })
  @IsString()
  pathName: string;

  @ApiProperty({ description: 'Parent monitor' })
  @IsOptional()
  parent: any | null;

  @ApiProperty({ description: 'Child monitor IDs' })
  @IsArray()
  childrenIDs: number[];

  @ApiProperty({ description: 'URL to monitor' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'HTTP method' })
  @IsString()
  method: string;

  @ApiProperty({ description: 'Hostname' })
  @IsString()
  @IsOptional()
  hostname: string | null;

  @ApiProperty({ description: 'Port number' })
  @IsNumber()
  @IsOptional()
  port: number | null;

  @ApiProperty({ description: 'Maximum retries' })
  @IsNumber()
  maxretries: number;

  @ApiProperty({ description: 'Monitor weight' })
  @IsNumber()
  weight: number;

  @ApiProperty({ description: 'Active status' })
  @IsBoolean()
  active: boolean;

  @ApiProperty({ description: 'Force inactive status' })
  @IsBoolean()
  forceInactive: boolean;

  @ApiProperty({ description: 'Monitor type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Timeout in seconds' })
  @IsNumber()
  timeout: number;

  @ApiProperty({ description: 'Check interval' })
  @IsNumber()
  interval: number;

  @ApiProperty({ description: 'Tags associated with monitor' })
  @ValidateNested({ each: true })
  @Type(() => UptimeKumaTagDto)
  @IsArray()
  tags: UptimeKumaTagDto[];

  @ApiProperty({ description: 'Accepted status codes' })
  @IsArray()
  accepted_statuscodes: string[];
}