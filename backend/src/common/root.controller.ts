import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
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
