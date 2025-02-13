// src/dto/dns-record.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DnsRecordDto {
  @ApiProperty({
    description: 'Type of DNS record (A, AAAA, CNAME, etc.)',
    example: 'A'
  })
  type: string;

  @ApiProperty({
    description: 'Value of the DNS record',
    example: '93.184.216.34',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } }
    ]
  })
  value: string | string[];

  @ApiProperty({
    description: 'Time to live in seconds',
    example: 300,
    required: false
  })
  ttl?: number;
}