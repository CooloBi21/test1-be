"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const provinceController_1 = require("../controllers/provinceController");
const router = express_1.default.Router();
// GET /api/provinces
router.get("/", provinceController_1.getProvinces);
exports.default = router;
