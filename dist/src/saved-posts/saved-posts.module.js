"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedPostsModule = void 0;
const common_1 = require("@nestjs/common");
const saved_posts_controller_1 = require("./saved-posts.controller");
const saved_posts_service_1 = require("./saved-posts.service");
const auth_module_1 = require("../auth/auth.module");
let SavedPostsModule = class SavedPostsModule {
};
exports.SavedPostsModule = SavedPostsModule;
exports.SavedPostsModule = SavedPostsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [saved_posts_controller_1.SavedPostsController],
        providers: [saved_posts_service_1.SavedPostsService],
    })
], SavedPostsModule);
//# sourceMappingURL=saved-posts.module.js.map