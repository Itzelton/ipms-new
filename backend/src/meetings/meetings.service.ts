import { Injectable, NotFoundException } from '@nestjs/common';
import { MeetingRepository } from './repositories/meeting.repository';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly repo: MeetingRepository,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async create(supervisorId: string, dto: CreateMeetingDto) {
    const meeting = await this.repo.create(supervisorId, dto);
    await this.notifications.create({
      recipientId: dto.studentId,
      title: 'Meeting scheduled',
      message: `Your supervisor has scheduled a meeting: "${meeting.title}" on ${new Date(meeting.scheduledAt).toLocaleDateString()}.`,
      link: '/student/meetings',
    });
    await this.audit.log(supervisorId, 'create_meeting', 'Meeting', meeting.id, { title: meeting.title });
    return meeting;
  }

  findForStudent(studentId: string) {
    return this.repo.findForStudent(studentId);
  }

  findForSupervisor(supervisorId: string) {
    return this.repo.findForSupervisor(supervisorId);
  }

  async findOne(id: string) {
    const meeting = await this.repo.findOne(id);
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async update(id: string, supervisorId: string, dto: UpdateMeetingDto) {
    const meeting = await this.repo.update(id, dto);
    if (dto.status === 'COMPLETED' || dto.status === 'CANCELLED') {
      await this.notifications.create({
        recipientId: meeting.studentId,
        title: `Meeting ${dto.status === 'COMPLETED' ? 'completed' : 'cancelled'}`,
        message: `The meeting "${meeting.title}" has been marked as ${dto.status.toLowerCase()}.`,
        link: '/student/meetings',
      });
    }
    await this.audit.log(supervisorId, 'update_meeting', 'Meeting', id, dto);
    return meeting;
  }

  async remove(id: string, supervisorId: string) {
    const result = await this.repo.remove(id);
    await this.audit.log(supervisorId, 'delete_meeting', 'Meeting', id, {});
    return result;
  }
}
