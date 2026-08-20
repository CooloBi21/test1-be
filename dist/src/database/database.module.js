"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.DATABASE_POOL = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const database_service_1 = require("./database.service");
exports.DATABASE_POOL = 'DATABASE_POOL';
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            database_service_1.DatabaseService,
            {
                provide: exports.DATABASE_POOL,
                useFactory: () => {
                    if (process.env.DATABASE_URL) {
                        return new pg_1.Pool({
                            connectionString: process.env.DATABASE_URL,
                            ssl: { rejectUnauthorized: false },
                        });
                    }
                    return new pg_1.Pool({
                        host: process.env.DB_HOST,
                        port: Number(process.env.DB_PORT) || 5432,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                        ssl: { rejectUnauthorized: false },
                    });
                },
            },
        ],
        exports: [database_service_1.DatabaseService, exports.DATABASE_POOL],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map