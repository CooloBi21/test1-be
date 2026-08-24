import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReport(reporterId: number, dto: CreateReportDto): Promise<{
        created_at: Date;
        id: number;
        room_id: number;
        status: string;
        reason: string;
        reporter_id: number;
    }>;
    getAllReportsForAdmin(): Promise<({
        room: {
            title: string;
            id: number;
        };
        reporter: {
            id: number;
            full_name: string;
            email: string;
        };
    } & {
        created_at: Date;
        id: number;
        room_id: number;
        status: string;
        reason: string;
        reporter_id: number;
    })[]>;
    updateReportStatus(reportId: number, status: 'resolved' | 'dismissed'): Promise<{
        created_at: Date;
        id: number;
        room_id: number;
        status: string;
        reason: string;
        reporter_id: number;
    }>;
}
