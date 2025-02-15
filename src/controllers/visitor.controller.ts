import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { VisitorService } from '../services/visitor.service';
import { VisitorInfoResponseDto } from '../dto/visitor.dto';

@ApiTags('Info')
@Controller('info')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get()
  @ApiOperation({
    summary: 'Get visitor information',
    description: 'Returns detailed information about the current visitor including IP, location, and user agent details'
  })
  @ApiResponse({
    status: 200,
    description: 'Visitor information retrieved successfully',
    type: VisitorInfoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Could not retrieve visitor information'
  })
  async getVisitorInfo(@Req() request: Request): Promise<VisitorInfoResponseDto> {
    const ip = request.ip || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];

    if (ip === undefined || userAgent === undefined) {
      throw new Error('Could not retrieve visitor information');
    }

    return this.visitorService.getVisitorInfo(ip, userAgent);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the service is healthy and ready to accept requests'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  healthCheck(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Service is healthy',
    };
  }
}