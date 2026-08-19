"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    getConversations(req) {
        return this.chatService.getConversations(req.user.id);
    }
    getUnreadCount(req) {
        return this.chatService.getUnreadCount(req.user.id);
    }
    getMessages(conversationId) {
        return this.chatService.getMessages(conversationId);
    }
    createOrGetConversation(body, req) {
        return this.chatService.createOrGetConversation(req.user.id, body.targetUserId, body.roomId);
    }
    markAsRead(conversationId, req) {
        return this.chatService.markAsRead(conversationId, req.user.id);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('messages/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createOrGetConversation", null);
__decorate([
    (0, common_1.Post)('read/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "markAsRead", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('api/chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map