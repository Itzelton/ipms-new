import { PrismaService } from '../prisma/prisma.service';
export declare abstract class BaseRepository {
    protected readonly prisma: PrismaService;
    constructor(prisma: PrismaService);
}
