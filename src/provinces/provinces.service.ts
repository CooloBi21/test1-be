import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProvinceRow {
  code: string;
  name: string;
}

@Injectable()
export class ProvincesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProvinces(): Promise<ProvinceRow[]> {
    return this.prisma.provinces.findMany({
      select: {
        code: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
