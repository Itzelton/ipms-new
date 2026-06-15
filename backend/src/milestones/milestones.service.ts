import { Injectable } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MilestoneRepository } from './repositories/milestone.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly milestoneRepository: MilestoneRepository,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async create(createMilestoneDto: CreateMilestoneDto, actorId?: string) {
    const m = await this.milestoneRepository.create(createMilestoneDto);
    await this.auditService.log(actorId || null, 'create_milestone', 'Milestone', m.id, { title: m.title });
    await this.notificationsService.create({ recipientId: createMilestoneDto.projectId ? undefined : '', message: `Milestone created: ${m.title}`, link: `/projects/${createMilestoneDto.projectId}/milestones/${m.id}` });
    return m;
  }

  async findAll(pagination: PaginationDto) {
    return this.milestoneRepository.findAll(pagination);
  }

  async findOne(id: string) {
    return this.milestoneRepository.findOne(id);
  }

  async update(id: string, updateMilestoneDto: UpdateMilestoneDto, actorId?: string) {
    const m = await this.milestoneRepository.update(id, updateMilestoneDto);
    await this.auditService.log(actorId || null, 'update_milestone', 'Milestone', id, updateMilestoneDto);
    return m;
  }

  async remove(id: string, actorId?: string) {
    const res = await this.milestoneRepository.remove(id);
    await this.auditService.log(actorId || null, 'delete_milestone', 'Milestone', id, {});
    return res;
  }
}
