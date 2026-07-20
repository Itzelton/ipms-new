import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class RootController {
  @Public()
  @Get()
  health() {
    return {
      statusCode: 200,
      message: 'IPMS backend running',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
