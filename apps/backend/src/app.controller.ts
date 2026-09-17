import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('API')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getStatus(): { status: string; api: string; docs: string } {
    return {
      status: 'ok',
      api: '/api/v1',
      docs: '/api/v1/docs',
    };
  }
}
