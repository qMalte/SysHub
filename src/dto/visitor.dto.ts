import { ApiProperty } from '@nestjs/swagger';

export class UserAgentInfoDto {
  @ApiProperty({
    description: 'Browser name',
    example: 'Chrome',
    required: true
  })
  browser: string;

  @ApiProperty({
    description: 'Browser version',
    example: '120.0.0',
    required: true
  })
  version: string;

  @ApiProperty({
    description: 'Operating system',
    example: 'Windows 10',
    required: true
  })
  os: string;

  @ApiProperty({
    description: 'Device type',
    example: 'Desktop',
    required: true
  })
  device: string;
}

export class LocationInfoDto {
  @ApiProperty({
    description: 'Country name',
    example: 'Germany',
    required: true
  })
  country: string;

  @ApiProperty({
    description: 'City name',
    example: 'Berlin',
    required: true
  })
  city: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 52.520008,
    required: true
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 13.404954,
    required: true
  })
  longitude: number;
}

export class VisitorInfoResponseDto {
  @ApiProperty({
    description: 'IP address of the visitor',
    example: '192.168.1.1',
    required: true
  })
  ipAddress: string;

  @ApiProperty({
    description: 'Fully Qualified Domain Name',
    example: 'host.example.com',
    required: false,
    nullable: true
  })
  fqdn: string | null;

  @ApiProperty({
    description: 'Internet Service Provider',
    example: 'Deutsche Telekom AG',
    required: false,
    nullable: true
  })
  isp: string | null;

  @ApiProperty({
    description: 'Raw user agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: true
  })
  userAgent: string;

  @ApiProperty({
    description: 'Formatted user agent information',
    type: () => UserAgentInfoDto,
    required: true
  })
  userAgentInfo: UserAgentInfoDto;

  @ApiProperty({
    description: 'Geographic location information',
    type: () => LocationInfoDto,
    required: false,
    nullable: true
  })
  location: LocationInfoDto | null;

  @ApiProperty({
    description: 'Timestamp of the request',
    example: '2024-02-13T12:00:00Z',
    required: true
  })
  timestamp: Date;
}