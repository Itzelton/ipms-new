import { Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SubmissionRepository } from './repositories/submission.repository';
import { CreateSubmissionVersionDto } from './dto/create-submission-version.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DiscussionsService } from '../discussions/discussions.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto, authorId: string) {
    const submission = await this.submissionRepository.create(createSubmissionDto, authorId);
    await this.auditService.log(authorId || null, 'create_submission', 'Submission', submission.id, { projectId: submission.projectId });

    if (submission.projectId) {
      const project = await this.submissionRepository.prisma.project.findUnique({ where: { id: submission.projectId }, select: { supervisorId: true } });
      if (project?.supervisorId) {
        await this.notificationsService.create({
          recipientId: project.supervisorId,
          message: `New submission created for project ${submission.projectId}`,
          link: `/submissions/${submission.id}`,
        });
      }
    }

    const thread = await this.discussionsService.createThread({
      projectId: submission.projectId,
      submissionId: submission.id,
      title: `Submission discussion for ${submission.id}`,
      createdById: authorId,
    });

    await this.discussionsService.createMessage(thread.id, {
      content: `Submission created: ${createSubmissionDto.content}`,
      authorId,
    });

    return submission;
  }

  async findAll(pagination: PaginationDto) {
    return this.submissionRepository.findAll(pagination);
  }

  async findByAuthor(authorId: string, pagination: PaginationDto) {
    return this.submissionRepository.findByAuthor(authorId, pagination);
  }

  async findOne(id: string) {
    return this.submissionRepository.findOne(id);
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto, actorId?: string) {
    const res = await this.submissionRepository.update(id, updateSubmissionDto);
    await this.auditService.log(actorId || null, 'update_submission', 'Submission', id, updateSubmissionDto);
    return res;
  }

  async remove(id: string, actorId?: string) {
    const res = await this.submissionRepository.remove(id);
    await this.auditService.log(actorId || null, 'delete_submission', 'Submission', id, {});
    return res;
  }

  async createVersion(submissionId: string, authorId: string, dto: CreateSubmissionVersionDto) {
    const version = await this.submissionRepository.createVersion(submissionId, authorId, dto as any);
    await this.auditService.log(authorId || null, 'create_submission_version', 'SubmissionVersion', version.id, { submissionId, versionNumber: version.versionNumber });
    return version;
  }

  async listVersions(submissionId: string) {
    return this.submissionRepository.listVersions(submissionId);
  }

  async getVersion(submissionId: string, versionNumber: number) {
    return this.submissionRepository.getVersionByNumber(submissionId, versionNumber);
  }

  async revertToVersion(submissionId: string, versionId: string, userId: string) {
    const version = await this.submissionRepository.revertToVersion(submissionId, versionId, userId);
    await this.auditService.log(userId || null, 'revert_submission_version', 'SubmissionVersion', version.id, { submissionId, revertedFrom: versionId });
    return version;
  }
}
