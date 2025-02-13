// src/dto/dns-records.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { DnsRecordDto } from './ns-record.dto';

export class DnsRecordsDto {
  @ApiProperty({ type: [DnsRecordDto] })
  a: DnsRecordDto[];

  @ApiProperty({ type: [DnsRecordDto] })
  aaaa: DnsRecordDto[];

  @ApiProperty({ type: [DnsRecordDto] })
  cname: DnsRecordDto[];

  @ApiProperty({ type: [DnsRecordDto] })
  txt: DnsRecordDto[];

  @ApiProperty({ type: [DnsRecordDto] })
  mx: DnsRecordDto[];

  @ApiProperty({ type: [DnsRecordDto] })
  ns: DnsRecordDto[];
}