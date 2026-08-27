import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const getPrismaDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return databaseUrl;

  try {
    const url = new URL(databaseUrl);
    if (!url.searchParams.has('sslmode') && process.env.NODE_ENV !== 'production') {
      url.searchParams.set('sslmode', process.env.PRISMA_SSLMODE || 'disable');
    }
    return url.toString();
  } catch {
    return databaseUrl;
  }
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: getPrismaDatabaseUrl(),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
