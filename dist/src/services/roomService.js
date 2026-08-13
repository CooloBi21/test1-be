"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRooms = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllRooms = async () => {
    const result = await database_1.default.query(`
    SELECT
      id,
      title,
      thumbnail,
      price,
      area,
      city,
      district,
      content
    FROM rooms
    ORDER BY id DESC
  `);
    return result.rows;
};
exports.getAllRooms = getAllRooms;
