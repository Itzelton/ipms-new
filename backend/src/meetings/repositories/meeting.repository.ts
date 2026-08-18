import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';

const INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true, preferredName: true, email: true } },
  supervisor: { select: { id: true, firstName: true, lastName: true, preferredName: true, email: true } },
};

@Injectable()
export class MeetingRepository {
  constructor(readonly prisma: PrismaService) {}

  create(supervisorId: string, dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        supervisorId,
        studentId: dto.studentId,
        title: dto.title,
        scheduledAt: new Date(dto.scheduledAt),
        location: dto.location,
        agenda: dto.agenda,
      },
      include: INCLUDE,
    });
  }

  findForStudent(studentId: string) {
    return this.prisma.meeting.findMany({
      where: { studentId },
      orderBy: { scheduledAt: 'desc' },
      include: INCLUDE,
    });
  }

  findForSupervisor(supervisorId: string) {
    return this.prisma.meeting.findMany({
      where: { supervisorId },
      orderBy: { scheduledAt: 'desc' },
      include: INCLUDE,
    });
  }

  findOne(id: string) {
    return this.prisma.meeting.findUnique({ where: { id }, include: INCLUDE });
  }

  update(id: string, dto: UpdateMeetingDto) {
    return this.prisma.meeting.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: INCLUDE,
    });
  }

  remove(id: string) {
    return this.prisma.meeting.delete({ where: { id } });
  }
}
