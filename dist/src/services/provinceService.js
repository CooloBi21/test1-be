"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProvinces = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllProvinces = async () => {
    const result = await database_1.default.query(`
    SELECT code, name
    FROM provinces
    ORDER BY name
  `);
    return result.rows;
};
exports.getAllProvinces = getAllProvinces;
