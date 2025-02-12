import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class UptimeKumaHeartbeatDto {
  @ApiProperty({ description: 'Monitor ID' })
  @IsNumber()
  monitorID: number;

  @ApiProperty({ description: 'Status code' })
  @IsNumber()
  status: number;

  @ApiProperty({ description: 'Timestamp of the heartbeat' })
  @IsDateString()
  time: string;

  @ApiProperty({ description: 'Status message' })
  @IsString()
  msg: string;

  @ApiProperty({ description: 'Importance flag' })
  @IsBoolean()
  important: boolean;

  @ApiProperty({ description: 'Duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Timezone name' })
  @IsString()
  timezone: string;

  @ApiProperty({ description: 'Timezone offset' })
  @IsString()
  timezoneOffset: string;

  @ApiProperty({ description: 'Local date time' })
  @IsDateString()
  localDateTime: string;
}