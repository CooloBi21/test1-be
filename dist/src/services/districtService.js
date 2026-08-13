"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistrictsByProvince = exports.getAllDistricts = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllDistricts = async () => {
    const result = await database_1.default.query(`
    SELECT code, name, parent_code
    FROM districts
    ORDER BY name
  `);
    return result.rows;
};
exports.getAllDistricts = getAllDistricts;
const getDistrictsByProvince = async (parentCode) => {
    const result = await database_1.default.query(`
    SELECT code, name, parent_code
    FROM districts
    WHERE parent_code = $1
    ORDER BY name
    `, [parentCode]);
    return result.rows;
};
exports.getDistrictsByProvince = getDistrictsByProvince;
