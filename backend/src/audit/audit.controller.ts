import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditRepository } from './repositories/audit.repository';

@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditRepo: AuditRepository) {}

  @Get()
  findRecent(@Query('limit') limit?: string) {
    return this.auditRepo.findRecent(limit ? Math.min(Number(limit), 200) : 50);
  }
}
