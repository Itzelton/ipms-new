import { PrismaService } from '../../common/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
export declare class AnalyticsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: AnalyticsQueryDto): Promise<{
        id: string;
        projectId: string;
        metrics: import("@prisma/client/runtime/library").JsonValue;
        recordedAt: Date;
        note: string | null;
    }[]>;
    projectMetrics(projectId: string, query: AnalyticsQueryDto): Promise<{
        id: string;
        projectId: string;
        metrics: import("@prisma/client/runtime/library").JsonValue;
        recordedAt: Date;
        note: string | null;
    }[]>;
}
