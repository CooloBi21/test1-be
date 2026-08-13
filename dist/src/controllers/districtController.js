"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistrictsByProvince = exports.getDistricts = void 0;
const quan_huyen_json_1 = __importDefault(require("../data/quan_huyen.json"));
const getDistrictList = () => {
    return Array.isArray(quan_huyen_json_1.default)
        ? quan_huyen_json_1.default
        : Object.values(quan_huyen_json_1.default);
};
// ========================================
// GET ALL DISTRICTS
// ========================================
const getDistricts = (req, res) => {
    const districts = getDistrictList();
    res.json(districts);
};
exports.getDistricts = getDistricts;
// ========================================
// GET DISTRICTS BY PROVINCE
// ========================================
const getDistrictsByProvince = (req, res) => {
    const { parentCode } = req.query;
    // VALIDATE
    if (!parentCode) {
        return res.status(400).json({
            message: "parentCode là bắt buộc",
        });
    }
    // FILTER
    const districts = getDistrictList().filter((district) => String(district.parent_code) === String(parentCode));
    // RESPONSE
    return res.json(districts);
};
exports.getDistrictsByProvince = getDistrictsByProvince;
