import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getRooms(filterDto: GetRoomsFilterDto) {
    const { city, district, minPrice, maxPrice, minArea, maxArea } = filterDto;

    let query = `SELECT * FROM rooms WHERE 1 = 1`;
    const values: (string | number)[] = [];
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

  async getRoomById(id: string) {
    const result = await this.pool.query(`SELECT * FROM rooms WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }
    return result.rows[0];
  }

  async createRoom(dto: CreateRoomDto) {
    const { title, thumbnail, price, area, city, district, content } = dto;
    if (!title || price === undefined || area === undefined || !city || !district) {
      throw new BadRequestException('Thiếu thông tin bắt buộc');
    }

    const result = await this.pool.query(
      `
      INSERT INTO rooms (title, thumbnail, price, area, city, district, content)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [title, thumbnail || null, price, area, city, district, content || null]
    );

    return result.rows[0];
  }

  async updateRoom(id: string, dto: CreateRoomDto) {
    const { title, thumbnail, price, area, city, district, content } = dto;
    const result = await this.pool.query(
      `
      UPDATE rooms
      SET title = $1, thumbnail = $2, price = $3, area = $4, city = $5, district = $6, content = $7
      WHERE id = $8
      RETURNING *
      `,
      [title, thumbnail || null, price, area, city, district, content || null, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }
    return result.rows[0];
  }

  async deleteRoom(id: string) {
    const result = await this.pool.query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }
    return {
      message: 'Xóa phòng thành công',
      data: result.rows[0],
    };
  }
}