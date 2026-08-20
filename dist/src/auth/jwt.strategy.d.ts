import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: number;
        email: string;
    }): Promise<{
        created_at: Date | null;
        id: number;
        full_name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        role: string | null;
        is_active: boolean;
        verification_token: string | null;
    }>;
}
export {};
