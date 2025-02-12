import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UptimeKumaTagDto {
  @ApiProperty({ description: 'Tag ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Monitor ID the tag belongs to' })
  @IsNumber()
  monitor_id: number;

  @ApiProperty({ description: 'Tag type ID' })
  @IsNumber()
  tag_id: number;

  @ApiProperty({ description: 'Tag value' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Tag name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tag color in hex format' })
  @IsString()
  color: string;
}