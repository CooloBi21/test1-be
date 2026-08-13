"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const districtController_1 = require("../controllers/districtController");
const router = express_1.default.Router();
// ========================================
// GET TẤT CẢ QUẬN / HUYỆN
// ========================================
router.get("/", districtController_1.getDistricts);
// ========================================
// GET QUẬN / HUYỆN THEO TỈNH
// ========================================
router.get("/by-province", districtController_1.getDistrictsByProvince);
exports.default = router;
