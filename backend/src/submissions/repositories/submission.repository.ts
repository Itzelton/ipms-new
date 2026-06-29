import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { UpdateSubmissionDto } from '../dto/update-submission.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SubmissionStatus, EvidenceType } from '@prisma/client';

@Injectable()
export class SubmissionRepository {
  constructor(public readonly prisma: PrismaService) {}

  async create(data: CreateSubmissionDto, authorId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const submission = await prisma.submission.create({
        data: {
          projectId: data.projectId,
          milestoneId: data.milestoneId,
          authorId,
          content: data.content,
          evidenceType: data.evidenceType as any,
          fileUrl: data.fileUrl,
          metadata: data.metadata,
          status: (data.status as SubmissionStatus) || 'DRAFT',
        },
      });

      await prisma.submissionVersion.create({
        data: {
          submissionId: submission.id,
          versionNumber: 1,
          content: data.content,
          evidenceType: data.evidenceType,
          fileUrl: data.fileUrl,
          authorId,
          metadata: data.metadata,
        },
      });

      return submission;
    });
  }

  async findAll(pagination: PaginationDto) {
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.submission.findMany({
      skip,
      take,
      include: { author: true, project: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.submission.findUnique({ where: { id }, include: { author: true, project: true } });
  }

  async update(id: string, data: UpdateSubmissionDto) {
    return this.prisma.submission.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? (data.status as SubmissionStatus) : undefined,
        evidenceType: data.evidenceType ? (data.evidenceType as EvidenceType) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.submission.delete({ where: { id } });
  }

  async createVersion(submissionId: string, authorId: string, dto: { content: string; evidenceType?: string; fileUrl?: string; metadata?: any }) {
    return this.prisma.$transaction(async (prisma) => {
      const last = await prisma.submissionVersion.findFirst({ where: { submissionId }, orderBy: { versionNumber: 'desc' } });

      const nextVersion = last ? last.versionNumber + 1 : 1;

      const version = await prisma.submissionVersion.create({
        data: {
          submissionId,
          versionNumber: nextVersion,
          content: dto.content,
          evidenceType: dto.evidenceType as EvidenceType,
          fileUrl: dto.fileUrl,
          authorId,
          metadata: dto.metadata,
        },
      });

      await prisma.submission.update({ where: { id: submissionId }, data: { content: dto.content, evidenceType: dto.evidenceType as EvidenceType, fileUrl: dto.fileUrl } });

      return version;
    });
  }

  async listVersions(submissionId: string) {
    return this.prisma.submissionVersion.findMany({ where: { submissionId }, orderBy: { versionNumber: 'desc' } });
  }

  async getVersionByNumber(submissionId: string, versionNumber: number) {
    return this.prisma.submissionVersion.findFirst({ where: { submissionId, versionNumber } });
  }

  async getVersionById(versionId: string) {
    return this.prisma.submissionVersion.findUnique({ where: { id: versionId } });
  }

  async revertToVersion(submissionId: string, versionId: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const version = await prisma.submissionVersion.findUnique({ where: { id: versionId } });
      if (!version || version.submissionId !== submissionId) {
        throw new Error('Version not found for submission');
      }

      const last = await prisma.submissionVersion.findFirst({ where: { submissionId }, orderBy: { versionNumber: 'desc' } });
      const nextVersion = last ? last.versionNumber + 1 : 1;

      const newVersion = await prisma.submissionVersion.create({
        data: {
          submissionId,
          versionNumber: nextVersion,
          content: version.content,
          fileUrl: version.fileUrl,
          authorId: userId,
          metadata: { revertedFrom: versionId },
        },
      });

      await prisma.submission.update({ where: { id: submissionId }, data: { content: newVersion.content, fileUrl: newVersion.fileUrl } });

      return newVersion;
    });
  }

}
