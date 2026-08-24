import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(req: any, dto: CreateReportDto): Promise<{
        created_at: Date;
        id: number;
        room_id: number;
        status: string;
        reason: string;
        reporter_id: number;
    }>;
    getAllReports(): Promise<({
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
    updateStatus(id: number, status: 'resolved' | 'dismissed'): Promise<{
        created_at: Date;
        id: number;
        room_id: number;
        status: string;
        reason: string;
        reporter_id: number;
    }>;
}
