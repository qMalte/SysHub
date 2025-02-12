import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UptimeKumaHeartbeatDto } from './uptimekuma-heartbeat.dto';
import { UptimeKumaMonitorDto } from './uptimekuma-monitor.dto';

export class UptimeKumaResponseDto {
  @ApiProperty({ description: 'Heartbeat information' })
  @ValidateNested()
  @Type(() => UptimeKumaHeartbeatDto)
  heartbeat: UptimeKumaHeartbeatDto;

  @ApiProperty({ description: 'Monitor information' })
  @ValidateNested()
  @Type(() => UptimeKumaMonitorDto)
  monitor: UptimeKumaMonitorDto;

  @ApiProperty({ description: 'Response message' })
  @IsString()
  msg: string;
}