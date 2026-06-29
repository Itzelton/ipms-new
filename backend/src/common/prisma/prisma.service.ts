import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not configured. Skipping Prisma initialization.');
      return;
    }

    try {
      await this.$connect();
    } catch (error: any) {
      console.warn('Prisma failed to connect. Running backend in fallback mode without a database.');
      console.warn(error?.message ?? error);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
