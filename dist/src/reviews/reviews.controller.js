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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    submitReview(req, roomId, rating, comment) {
        return this.reviewsService.upsertReview(req.user.id, roomId, rating, comment);
    }
    getMyReviews(req) {
        return this.reviewsService.getMyReviews(req.user.id);
    }
    getReviewsAboutMe(req) {
        return this.reviewsService.getReviewsAboutMe(req.user.id);
    }
    deleteReview(req, reviewId) {
        return this.reviewsService.deleteReview(req.user.id, reviewId);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('rating', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "submitReview", null);
__decorate([
    (0, common_1.Get)('my-reviews'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Get)('about-me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getReviewsAboutMe", null);
__decorate([
    (0, common_1.Delete)(':review_id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('review_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "deleteReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('api/reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map