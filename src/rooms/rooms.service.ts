// src/rooms/rooms.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { DATABASE_POOL } from '../database/database.module';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

const ROOM_IMAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'ROOM-IMAGES';
const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'avif',
  'heic',
  'heif',
  'svg',
]);

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 1. LẤY DANH SÁCH PHÒNG TRỌ (Hỗ trợ lọc & bài đăng của tôi)
  async uploadRoomImages(files: any[], userId: number) {
    if (!files.length) {
      throw new BadRequestException('Vui long chon it nhat 1 file anh');
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new BadRequestException(
        'Backend chua cau hinh SUPABASE_URL hoac SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY',
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const originalName = String(file.originalname || 'room-image');
        const extension = originalName.split('.').pop()?.toLowerCase() || '';
        const isImage =
          String(file.mimetype || '').startsWith('image/') ||
          ACCEPTED_IMAGE_EXTENSIONS.has(extension);

        if (!isImage || !file.buffer) {
          throw new BadRequestException(`File ${originalName} khong phai anh hop le`);
        }

        const safeExtension = ACCEPTED_IMAGE_EXTENSIONS.has(extension) ? extension : 'jpg';
        const filePath = `rooms/${userId}/${Date.now()}-${randomUUID()}.${safeExtension}`;

        const { error } = await supabase.storage
          .from(ROOM_IMAGE_BUCKET)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype || 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw new BadRequestException(`Upload anh that bai: ${error.message}`);
        }

        const { data } = supabase.storage.from(ROOM_IMAGE_BUCKET).getPublicUrl(filePath);
        return data.publicUrl;
      }),
    );

    return {
      urls: uploadedImages,
    };
  }

  async getRooms(filterDto: GetRoomsFilterDto & { userId?: number }) {
    const { city, district, minPrice, maxPrice, minArea, maxArea, userId } = filterDto;

    let query = `
      SELECT 
        r.*, 
        p.name AS city_name, 
        d.name AS district_name,
        CASE WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'full_name', u.full_name,
            'phone', u.phone,
            'avatar', u.avatar,
            'is_verified', u.is_active
          )
        ELSE NULL END AS user
      FROM rooms r
      LEFT JOIN provinces p ON TRIM(r.city) = TRIM(p.code)
      LEFT JOIN districts d ON TRIM(r.district) = TRIM(d.code)
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1 = 1
    `;
    const values: any[] = [];
    let index = 1;

    // Tách biệt quyền xem phòng: Chủ trọ xem tất cả phòng của họ, công khai chỉ hiển thị phòng đã duyệt 'approved'
    if (userId) {
      query += ` AND r.user_id = $${index++}`;
      values.push(Number(userId));
    } else {
      query += ` AND r.status = 'approved'`;
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

  // 2. LẤY CHI TIẾT 1 PHÒNG TRỌ (Đã JOIN kèm thông tin User/Owner)
  async getRoomById(id: string) {
    const result = await this.pool.query(
      `
      SELECT 
        r.*, 
        p.name AS city_name, 
        d.name AS district_name,
        CASE WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'full_name', u.full_name,
            'phone', u.phone,
            'avatar', u.avatar,
            'is_verified', u.is_active
          )
        ELSE NULL END AS user
      FROM rooms r
      LEFT JOIN provinces p ON TRIM(r.city) = TRIM(p.code)
      LEFT JOIN districts d ON TRIM(r.district) = TRIM(d.code)
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }
    return result.rows[0];
  }

  // 2b. LẤY TẤT CẢ PHÒNG CHO ADMIN (mọi trạng thái, ưu tiên chờ duyệt)
  async findAllForAdmin() {
    const result = await this.pool.query(
      `
      SELECT 
        r.*, 
        p.name AS city_name, 
        d.name AS district_name,
        CASE WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'full_name', u.full_name,
            'email', u.email,
            'phone', u.phone,
            'avatar', u.avatar
          )
        ELSE NULL END AS user
      FROM rooms r
      LEFT JOIN provinces p ON TRIM(r.city) = TRIM(p.code)
      LEFT JOIN districts d ON TRIM(r.district) = TRIM(d.code)
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY 
        CASE r.status 
          WHEN 'pending' THEN 0 
          WHEN 'approved' THEN 1 
          ELSE 2 
        END,
        r.id DESC
      `,
    );

    return {
      total: result.rows.length,
      data: result.rows,
    };
  }

  // 3. TẠO PHÒNG TRỌ MỚI (Trạng thái mặc định là pending chờ duyệt)
  async createRoom(dto: CreateRoomDto, userId?: number) {
    const { title, price, area, city, district, content, thumbnail, images, amenities } = dto;
    
    if (
      !title ||
      price === undefined ||
      area === undefined ||
      !city ||
      !district
    ) {
      throw new BadRequestException('Thiếu thông tin bắt buộc');
    }

    const result = await this.pool.query(
      `
      INSERT INTO rooms (title, price, area, city, district, content, thumbnail, images, amenities, user_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *
      `,
      [
        title,
        price,
        area,
        city,
        district,
        content || null, // Chú ý: Dùng cột content như trong DB thay vì description để tránh lỗi
        thumbnail || null,
        JSON.stringify(images || []),
        JSON.stringify(amenities || []),
        userId || null,
      ]
    );

    return result.rows[0];
  }

  // 4. CẬP NHẬT PHÒNG TRỌ (Kiểm tra chính chủ + Diff chuẩn hóa + Thông báo thông minh)
  async updateRoom(id: string, dto: UpdateRoomDto, currentUserId: number) {
    // 4.1. Lấy room hiện tại
    const roomCheck = await this.pool.query(
      `SELECT * FROM rooms WHERE id = $1`,
      [id],
    );
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
    const fieldsToCompare = [
      'price',
      'title',
      'thumbnail',
      'images', 
      'amenities',
      'area',
      'city',
      'district',
      'content',
    ];

    const fieldNamesVN: Record<string, string> = {
      price: 'giá thuê',
      title: 'tiêu đề',
      thumbnail: 'ảnh đại diện',
      images: 'danh sách ảnh',
      amenities: 'tiện ích phòng',
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
          const oldNum =
            oldRoom[field] !== null && oldRoom[field] !== undefined
              ? Number(oldRoom[field])
              : 0;
          const newNum =
            dto[field] !== null && dto[field] !== undefined
              ? Number(dto[field])
              : 0;

          if (oldNum !== newNum) {
            isChanged = true;
          }
        } 
        // So sánh riêng cho kiểu Mảng/JSON (images, amenities)
        else if (field === 'images' || field === 'amenities') {
          const oldArr = typeof oldRoom[field] === 'string' ? oldRoom[field] : JSON.stringify(oldRoom[field] || []);
          const newArr = JSON.stringify(dto[field] || []);
          if (oldArr !== newArr) {
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
    const { title, thumbnail, price, area, city, district, content, images, amenities } = {
      ...oldRoom,
      ...dto,
    };
    
    const finalImagesUpdate = images ? JSON.stringify(images) : '[]';
    const finalAmenitiesUpdate = amenities ? JSON.stringify(amenities) : '[]';

    const result = await this.pool.query(
      `
      UPDATE rooms
      SET title = $1, thumbnail = $2, price = $3, area = $4, city = $5, district = $6, content = $7, images = $8, amenities = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        title,
        thumbnail || null,
        price,
        area,
        city,
        district,
        content || null,
        finalImagesUpdate,
        finalAmenitiesUpdate,
        id,
      ],
    );
    const updatedRoom = result.rows[0];

    // 4.5. Tạo Notification thông minh dựa trên danh sách thay đổi thực sự
    const savedUsers = await this.prisma.saved_posts.findMany({
      where: { room_id: Number(id) },
      select: { user_id: true },
    });

    const changedFieldNames = changes
      .map((c) => fieldNamesVN[c.field] || c.field)
      .join(', ');
    const priceChange = changes.find((c) => c.field === 'price');

    let notiTitle = `Phòng đã lưu thay đổi ${changedFieldNames}`;
    let notiBody = `Phòng "${updatedRoom.title}" vừa cập nhật: ${changedFieldNames}.`;

    // Định dạng thông báo riêng nếu CHỈ có giá thay đổi
    if (priceChange && changes.length === 1) {
      notiTitle = 'Phòng đã lưu thay đổi giá';
      notiBody = `Phòng "${updatedRoom.title}" đổi giá từ ${Number(
        priceChange.oldValue,
      ).toLocaleString('vi-VN')}đ sang ${Number(
        priceChange.newValue,
      ).toLocaleString('vi-VN')}đ.`;
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

  // 5. CẬP NHẬT TRẠNG THÁI PHÒNG (Dành cho Admin duyệt / từ chối bài đăng)
  async updateRoomStatus(id: number, status: 'approved' | 'rejected') {
    try {
      const updatedRoom = await this.prisma.rooms.update({
        where: { id: Number(id) },
        data: { status: status as any },
      });

      return {
        message: `Đã cập nhật trạng thái phòng thành ${status}`,
        room: updatedRoom,
      };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy phòng với ID này!');
      }
      throw error;
    }
  }

  // 6. XÓA PHÒNG TRỌ (Kiểm tra chính chủ + Thông báo bài đăng bị gỡ)
  async deleteRoom(id: string, currentUserId: number) {
    // 6.1. Kiểm tra tồn tại
    const roomCheck = await this.pool.query(
      `SELECT * FROM rooms WHERE id = $1`,
      [id],
    );
    if (roomCheck.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

    const roomData = roomCheck.rows[0];

    // 6.2. Kiểm tra chính chủ
    if (Number(roomData.user_id) !== Number(currentUserId)) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đăng này');
    }

    // 6.3. Lấy danh sách người đã lưu phòng trước khi xóa
    const savedUsers = await this.prisma.saved_posts.findMany({
      where: { room_id: Number(id) },
      select: { user_id: true },
    });

    // 6.4. Xóa bài đăng khỏi Database
    const client = await this.pool.connect();
    let deletedRoom: any;

    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM saved_posts WHERE room_id = $1`, [id]);
      await client.query(`DELETE FROM room_views WHERE room_id = $1`, [id]);
      await client.query(`DELETE FROM reviews WHERE room_id = $1`, [id]);
      await client.query(`DELETE FROM reports WHERE room_id = $1`, [id]);
      await client.query(`UPDATE conversations SET room_id = NULL WHERE room_id = $1`, [id]);

      const result = await client.query(
        `DELETE FROM rooms WHERE id = $1 RETURNING *`,
        [id],
      );
      deletedRoom = result.rows[0];
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // 6.5. Báo cho người dùng đã lưu phòng biết tin bị gỡ
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

    return { message: 'Xóa phòng thành công', data: deletedRoom };
  }
}
