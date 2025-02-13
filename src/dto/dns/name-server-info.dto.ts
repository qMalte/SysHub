// src/dto/name-server-info.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class NameServerInfoDto {
  @ApiProperty({
    description: 'DNS server hostname',
    example: 'ns1.example.com'
  })
  server: string;

  @ApiProperty({
    description: 'Indicates if this nameserver was used for the current query',
    example: true
  })
  isUsedForQuery: boolean;
}