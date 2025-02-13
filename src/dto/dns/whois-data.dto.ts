// src/dto/whois-data.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class WhoisDataDto {
  @ApiProperty({
    description: 'List of authoritative nameservers',
    example: ['ns1.example.com', 'ns2.example.com']
  })
  nameservers: string[];

  @ApiProperty({
    description: 'Domain registrar name',
    example: 'Example Registrar, LLC',
    required: false
  })
  registrar?: string;

  @ApiProperty({
    description: 'Domain creation date',
    example: '2020-01-01T00:00:00Z',
    required: false
  })
  creationDate?: string;

  @ApiProperty({
    description: 'Domain expiration date',
    example: '2025-01-01T00:00:00Z',
    required: false
  })
  expirationDate?: string;
}