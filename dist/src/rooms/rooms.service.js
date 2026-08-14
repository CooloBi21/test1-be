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
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let RoomsService = class RoomsService {
    constructor(pool) {
        this.pool = pool;
    }
    async getRooms(filterDto) {
        const { city, district, minPrice, maxPrice, minArea, maxArea } = filterDto;
        let query = `SELECT * FROM rooms WHERE 1 = 1`;
        const values = [];
        let index = 1;
        if (city) {
            query += ` AND city = $${index++}`;
            values.push(city);
        }
        if (district) {
            query += ` AND district = $${index++}`;
            values.push(district);
        }
        if (minPrice !== undefined && minPrice !== '') {
            query += ` AND price >= $${index++}`;
            values.push(Number(minPrice));
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            query += ` AND price <= $${index++}`;
            values.push(Number(maxPrice));
        }
        if (minArea !== undefined && minArea !== '') {
            query += ` AND area >= $${index++}`;
            values.push(Number(minArea));
        }
        if (maxArea !== undefined && maxArea !== '') {
            query += ` AND area <= $${index++}`;
            values.push(Number(maxArea));
        }
        query += ` ORDER BY id DESC`;
        const result = await this.pool.query(query, values);
        return {
            total: result.rows.length,
            data: result.rows,
        };
    }
    async getRoomById(id) {
        const result = await this.pool.query(`SELECT * FROM rooms WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Không tìm thấy phòng');
        }
        return result.rows[0];
    }
    async createRoom(dto) {
        const { title, thumbnail, price, area, city, district, content } = dto;
        if (!title || price === undefined || area === undefined || !city || !district) {
            throw new common_1.BadRequestException('Thiếu thông tin bắt buộc');
        }
        const result = await this.pool.query(`
      INSERT INTO rooms (title, thumbnail, price, area, city, district, content)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `, [title, thumbnail || null, price, area, city, district, content || null]);
        return result.rows[0];
    }
    async updateRoom(id, dto) {
        const { title, thumbnail, price, area, city, district, content } = dto;
        const result = await this.pool.query(`
      UPDATE rooms
      SET title = $1, thumbnail = $2, price = $3, area = $4, city = $5, district = $6, content = $7
      WHERE id = $8
      RETURNING *
      `, [title, thumbnail || null, price, area, city, district, content || null, id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Không tìm thấy phòng');
        }
        return result.rows[0];
    }
    async deleteRoom(id) {
        const result = await this.pool.query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Không tìm thấy phòng');
        }
        return {
            message: 'Xóa phòng thành công',
            data: result.rows[0],
        };
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map