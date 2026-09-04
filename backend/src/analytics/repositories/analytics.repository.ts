import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

interface HeatmapRow {
  date: string;
  count: bigint;
  submissions: bigint;
  messages: bigint;
  reviews: bigint;
  milestones: bigint;
}

export interface HeatmapDay {
  date: string;
  count: number;
  breakdown: { submissions: number; messages: number; reviews: number; milestones: number };
}

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AnalyticsQueryDto) {
    return this.prisma.analyticsSnapshot.findMany({
      where: { projectId: query.projectId },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }

  async projectMetrics(projectId: string, query: AnalyticsQueryDto) {
    return this.prisma.analyticsSnapshot.findMany({
      where: { projectId },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }

  async userHeatmap(userId: string, year: number): Promise<HeatmapDay[]> {
    const rows = await this.prisma.$queryRaw<HeatmapRow[]>`
      SELECT
        date::text,
        SUM(count)       AS count,
        SUM(submissions) AS submissions,
        SUM(messages)    AS messages,
        SUM(reviews)     AS reviews,
        0::bigint        AS milestones
      FROM (
        -- Submissions authored by user (students)
        SELECT DATE("createdAt") AS date, COUNT(*) AS count,
               COUNT(*) AS submissions, 0::bigint AS messages, 0::bigint AS reviews
        FROM "Submission"
        WHERE "authorId" = ${userId}
          AND EXTRACT(YEAR FROM "createdAt") = ${year}
        GROUP BY DATE("createdAt")

        UNION ALL

        -- Discussion messages sent by user
        SELECT DATE("createdAt") AS date, COUNT(*) AS count,
               0::bigint AS submissions, COUNT(*) AS messages, 0::bigint AS reviews
        FROM "DiscussionMessage"
        WHERE "authorId" = ${userId}
          AND EXTRACT(YEAR FROM "createdAt") = ${year}
        GROUP BY DATE("createdAt")

        UNION ALL

        -- Submission status updates (reviews) by supervisor — tracked via updatedAt when status changes
        SELECT DATE("updatedAt") AS date, COUNT(*) AS count,
               0::bigint AS submissions, 0::bigint AS messages, COUNT(*) AS reviews
        FROM "Submission"
        WHERE "status" IN ('APPROVED', 'REVISION_REQUIRED', 'UNDER_REVIEW')
          AND EXTRACT(YEAR FROM "updatedAt") = ${year}
          AND "projectId" IN (
            SELECT id FROM "Project" WHERE "supervisorId" = ${userId}
            UNION
            SELECT "projectId" FROM "ProjectAssignment" WHERE "userId" = ${userId}
          )
        GROUP BY DATE("updatedAt")

        UNION ALL

        -- Meetings scheduled by supervisor
        SELECT DATE("createdAt") AS date, COUNT(*) AS count,
               0::bigint AS submissions, 0::bigint AS messages, COUNT(*) AS reviews
        FROM "Meeting"
        WHERE "supervisorId" = ${userId}
          AND EXTRACT(YEAR FROM "createdAt") = ${year}
        GROUP BY DATE("createdAt")
      ) t
      GROUP BY date
      ORDER BY date
    `;

    return rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
      breakdown: {
        submissions: Number(r.submissions),
        messages: Number(r.messages),
        reviews: Number(r.reviews),
        milestones: 0,
      },
    }));
  }

  async projectHeatmap(projectId: string, year: number): Promise<HeatmapDay[]> {
    const rows = await this.prisma.$queryRaw<HeatmapRow[]>`
      SELECT
        date::text,
        SUM(count)       AS count,
        SUM(submissions) AS submissions,
        SUM(messages)    AS messages,
        0::bigint        AS reviews,
        SUM(milestones)  AS milestones
      FROM (
        SELECT DATE("createdAt") AS date, COUNT(*) AS count,
               COUNT(*) AS submissions, 0::bigint AS messages, 0::bigint AS milestones
        FROM "Submission"
        WHERE "projectId" = ${projectId}
          AND EXTRACT(YEAR FROM "createdAt") = ${year}
        GROUP BY DATE("createdAt")

        UNION ALL

        SELECT DATE(dm."createdAt") AS date, COUNT(*) AS count,
               0::bigint AS submissions, COUNT(*) AS messages, 0::bigint AS milestones
        FROM "DiscussionMessage" dm
        JOIN "DiscussionThread" dt ON dm."threadId" = dt.id
        WHERE dt."projectId" = ${projectId}
          AND EXTRACT(YEAR FROM dm."createdAt") = ${year}
        GROUP BY DATE(dm."createdAt")

        UNION ALL

        SELECT DATE("completedAt") AS date, COUNT(*) AS count,
               0::bigint AS submissions, 0::bigint AS messages, COUNT(*) AS milestones
        FROM "Milestone"
        WHERE "projectId" = ${projectId}
          AND "completedAt" IS NOT NULL
          AND EXTRACT(YEAR FROM "completedAt") = ${year}
        GROUP BY DATE("completedAt")
      ) t
      GROUP BY date
      ORDER BY date
    `;

    return rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
      breakdown: {
        submissions: Number(r.submissions),
        messages: Number(r.messages),
        reviews: 0,
        milestones: Number(r.milestones),
      },
    }));
  }
}
