import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 1. LẤY DANH SÁCH PHÒNG TRỌ (Hỗ trợ lọc & bài đăng của tôi)
  async getRooms(filterDto: GetRoomsFilterDto & { userId?: number }) {
    const { city, district, minPrice, maxPrice, minArea, maxArea, userId } = filterDto;

    let query = `
      SELECT 
        r.*, 
        p.name AS city_name, 
        d.name AS district_name 
      FROM rooms r
      LEFT JOIN provinces p ON TRIM(r.city) = TRIM(p.code)
      LEFT JOIN districts d ON TRIM(r.district) = TRIM(d.code)
      WHERE 1 = 1
    `;
    const values: any[] = [];
    let index = 1;

    // Lọc theo User ID (khi xem bài đăng của tôi)
    if (userId) {
      query += ` AND r.user_id = $${index++}`;
      values.push(Number(userId));
    }

    if (city && city !== 'undefined' && city !== '') {
      const cityClean = String(city).trim();
      const cityPadded = cityClean.padStart(2, '0');
      query += ` AND (TRIM(r.city) = $${index} OR TRIM(r.city) = $${index + 1})`;
      values.push(cityClean, cityPadded);
      index += 2;
    }

    if (district && district !== 'undefined' && district !== '') {
      const distClean = String(district).trim();
      query += ` AND TRIM(r.district) = $${index++}`;
      values.push(distClean);
    }

    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      query += ` AND r.price >= $${index++}`;
      values.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      query += ` AND r.price <= $${index++}`;
      values.push(Number(maxPrice));
    }

    if (minArea !== undefined && minArea !== '' && !isNaN(Number(minArea))) {
      query += ` AND r.area >= $${index++}`;
      values.push(Number(minArea));
    }
    if (maxArea !== undefined && maxArea !== '' && !isNaN(Number(maxArea))) {
      query += ` AND r.area <= $${index++}`;
      values.push(Number(maxArea));
    }

    query += ` ORDER BY r.id DESC`;

    try {
      const result = await this.pool.query(query, values);
      return {
        total: result.rows.length,
        data: result.rows,
      };
    } catch (error) {
      console.error('❌ [SQL ERROR]:', error);
      throw error;
    }
  }

  // 2. LẤY CHI TIẾT 1 PHÒNG TRỌ
  async getRoomById(id: string) {
    const result = await this.pool.query(
      `
      SELECT r.*, p.name AS city_name, d.name AS district_name 
      FROM rooms r
      LEFT JOIN provinces p ON TRIM(r.city) = TRIM(p.code)
      LEFT JOIN districts d ON TRIM(r.district) = TRIM(d.code)
      WHERE r.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }
    return result.rows[0];
  }

  // 3. TẠO PHÒNG TRỌ MỚI
  async createRoom(dto: CreateRoomDto, userId?: number) {
    const { title, thumbnail, price, area, city, district, content } = dto;
    if (!title || price === undefined || area === undefined || !city || !district) {
      throw new BadRequestException('Thiếu thông tin bắt buộc');
    }

    const result = await this.pool.query(
      `
      INSERT INTO rooms (title, thumbnail, price, area, city, district, content, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [title, thumbnail || null, price, area, city, district, content || null, userId || null]
    );

    return result.rows[0];
  }

  // 4. CẬP NHẬT PHÒNG TRỌ (Kiểm tra chính chủ + Diff chuẩn hóa + Thông báo thông minh)
  async updateRoom(id: string, dto: UpdateRoomDto, currentUserId: number) {
    // 4.1. Lấy room hiện tại
    const roomCheck = await this.pool.query(`SELECT * FROM rooms WHERE id = $1`, [id]);
    if (roomCheck.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

    const oldRoom = roomCheck.rows[0];

    // 4.2. Kiểm tra quyền sở hữu bài đăng
    if (Number(oldRoom.user_id) !== Number(currentUserId)) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài đăng này');
    }

    // 4.3. Tính Diff (Xử lý triệt để lỗi Postgres NUMERIC dạng "10000.00" & null/empty)
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const fieldsToCompare = ['price', 'title', 'thumbnail', 'area', 'city', 'district', 'content'];

    const fieldNamesVN: Record<string, string> = {
      price: 'giá thuê',
      title: 'tiêu đề',
      thumbnail: 'ảnh đại diện',
      area: 'diện tích',
      city: 'tỉnh/thành phố',
      district: 'quận/huyện',
      content: 'nội dung mô tả',
    };

    fieldsToCompare.forEach((field) => {
      if (dto[field] !== undefined) {
        let isChanged = false;

        // Chuẩn hóa so sánh cho kiểu Số (price, area)
        if (field === 'price' || field === 'area') {
          const oldNum = oldRoom[field] !== null && oldRoom[field] !== undefined ? Number(oldRoom[field]) : 0;
          const newNum = dto[field] !== null && dto[field] !== undefined ? Number(dto[field]) : 0;

          if (oldNum !== newNum) {
            isChanged = true;
          }
        } 
        // Chuẩn hóa so sánh cho kiểu Chuỗi (tránh "" !== null)
        else {
          const oldStr = oldRoom[field] ? String(oldRoom[field]).trim() : '';
          const newStr = dto[field] ? String(dto[field]).trim() : '';

          if (oldStr !== newStr) {
            isChanged = true;
          }
        }

        if (isChanged) {
          changes.push({
            field,
            oldValue: oldRoom[field],
            newValue: dto[field],
          });
        }
      }
    });

    // Nếu không có thông tin nào thay đổi thực sự
    if (changes.length === 0) {
      return { data: oldRoom, changes: [] };
    }

    // 4.4. Cập nhật vào DB
    const { title, thumbnail, price, area, city, district, content } = { ...oldRoom, ...dto };
    const result = await this.pool.query(
      `
      UPDATE rooms
      SET title = $1, thumbnail = $2, price = $3, area = $4, city = $5, district = $6, content = $7
      WHERE id = $8
      RETURNING *
      `,
      [title, thumbnail || null, price, area, city, district, content || null, id]
    );
    const updatedRoom = result.rows[0];

    // 4.5. Tạo Notification thông minh dựa trên danh sách thay đổi thực sự
    const savedUsers = await this.prisma.saved_posts.findMany({
      where: { room_id: Number(id) },
      select: { user_id: true },
    });

    const changedFieldNames = changes.map((c) => fieldNamesVN[c.field] || c.field).join(', ');
    const priceChange = changes.find((c) => c.field === 'price');

    let notiTitle = `Phòng đã lưu thay đổi ${changedFieldNames}`;
    let notiBody = `Phòng "${updatedRoom.title}" vừa cập nhật: ${changedFieldNames}.`;

    // Định dạng thông báo riêng nếu CHỈ có giá thay đổi
    if (priceChange && changes.length === 1) {
      notiTitle = 'Phòng đã lưu thay đổi giá';
      notiBody = `Phòng "${updatedRoom.title}" đổi giá từ ${Number(priceChange.oldValue).toLocaleString('vi-VN')}đ sang ${Number(priceChange.newValue).toLocaleString('vi-VN')}đ.`;
    }

    for (const item of savedUsers) {
      if (Number(item.user_id) !== Number(updatedRoom.user_id)) {
        await this.notificationsService.createNotification({
          user_id: item.user_id,
          type: 'saved_room_updated',
          title: notiTitle,
          body: notiBody,
          target_url: `/rooms/${id}`,
          entity_type: 'room',
          entity_id: Number(id),
        });
      }
    }

    return { data: updatedRoom, changes };
  }

  // 5. XÓA PHÒNG TRỌ (Kiểm tra chính chủ + Thông báo bài đăng bị gỡ)
  async deleteRoom(id: string, currentUserId: number) {
    // 5.1. Kiểm tra tồn tại
    const roomCheck = await this.pool.query(`SELECT * FROM rooms WHERE id = $1`, [id]);
    if (roomCheck.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

    const roomData = roomCheck.rows[0];

    // 5.2. Kiểm tra chính chủ
    if (Number(roomData.user_id) !== Number(currentUserId)) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đăng này');
    }

    // 5.3. Lấy danh sách người đã lưu phòng trước khi xóa
    const savedUsers = await this.prisma.saved_posts.findMany({
      where: { room_id: Number(id) },
      select: { user_id: true },
    });

    // 5.4. Xóa bài đăng khỏi Database
    const result = await this.pool.query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [id]);

    // 5.5. Báo cho người dùng đã lưu phòng biết tin bị gỡ
    for (const item of savedUsers) {
      if (Number(item.user_id) !== Number(roomData.user_id)) {
        await this.notificationsService.createNotification({
          user_id: item.user_id,
          type: 'saved_room_updated',
          title: 'Tin đã lưu đã bị gỡ',
          body: `Phòng "${roomData.title}" mà bạn đã lưu vừa bị chủ nhà xóa/gỡ khỏi hệ thống.`,
          target_url: `/saved-posts`,
          entity_type: 'room',
          entity_id: Number(id),
        });
      }
    }

    return { message: 'Xóa phòng thành công', data: result.rows[0] };
  }
}