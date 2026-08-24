"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const provinces_module_1 = require("./provinces/provinces.module");
const districts_module_1 = require("./districts/districts.module");
const rooms_module_1 = require("./rooms/rooms.module");
const candlestick_module_1 = require("./candlestick/candlestick.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const saved_posts_module_1 = require("./saved-posts/saved-posts.module");
const room_views_module_1 = require("./room-views/room-views.module");
const reviews_module_1 = require("./reviews/reviews.module");
const chat_module_1 = require("./chat/chat.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
const admin_users_module_1 = require("./admin-users/admin-users.module");
const support_tickets_module_1 = require("./support-tickets/support-tickets.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            provinces_module_1.ProvincesModule,
            districts_module_1.DistrictsModule,
            rooms_module_1.RoomsModule,
            candlestick_module_1.CandlestickModule,
            saved_posts_module_1.SavedPostsModule,
            room_views_module_1.RoomViewsModule,
            reviews_module_1.ReviewsModule,
            chat_module_1.ChatModule,
            notifications_module_1.NotificationsModule,
            reports_module_1.ReportsModule,
            admin_users_module_1.AdminUsersModule,
            support_tickets_module_1.SupportTicketsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map