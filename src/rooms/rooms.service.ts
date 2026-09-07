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
import { RoomStatus } from '@prisma/client';
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

    const where: any = {};
    if (userId) {
      where.user_id = Number(userId);
    } else {
      where.status = RoomStatus.approved;
    }

    if (city && city !== 'undefined' && city !== '') {
      const cityClean = String(city).trim();
      const cityPadded = cityClean.padStart(2, '0');

      where.city = {
        in: [cityClean, cityPadded],
      };
    }

    if (district && district !== 'undefined' && district !== '') {
      const distClean = String(district).trim();

      where.district = distClean;
    }

    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      where.price = {
        gte: Number(minPrice),
      };
    }

    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      where.price = {
        ...(where.price || {}),
        lte: Number(maxPrice),
      };
    }

    if (minArea !== undefined && minArea !== '' && !isNaN(Number(minArea))) {
      where.area = {
        gte: Number(minArea),
      };
    }

    if (maxArea !== undefined && maxArea !== '' && !isNaN(Number(maxArea))) {
      where.area = {
        ...(where.area || {}),
        lte: Number(maxArea),
      };
    }

    const rooms = await this.prisma.rooms.findMany({
      where,
      include: {
        provinces: true,
        districts: true,
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const data = rooms.map((room) => ({
      ...room,
      city_name: room.provinces?.name ?? null,
      district_name: room.districts?.name ?? null,
      user: room.user
        ? {
            id: room.user.id,
            full_name: room.user.full_name,
            phone: room.user.phone,
            avatar: room.user.avatar,
            is_verified: room.user.is_active,
          }
        : null,
    }));

    return {
      total: data.length,
      data,
    };
  }

  // 2. LẤY CHI TIẾT 1 PHÒNG TRỌ (Sử dụng Prisma)
  async getRoomById(id: string) {
    const room = await this.prisma.rooms.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        provinces: true,
        districts: true,
        user: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

    return {
      ...room,
      city_name: room.provinces?.name ?? null,
      district_name: room.districts?.name ?? null,
      user: room.user
        ? {
            id: room.user.id,
            full_name: room.user.full_name,
            phone: room.user.phone,
            avatar: room.user.avatar,
            is_verified: room.user.is_active,
          }
        : null,
    };
  }

  // 2b. LẤY TẤT CẢ PHÒNG CHO ADMIN (mọi trạng thái, ưu tiên chờ duyệt)
  async findAllForAdmin() {
    const rooms = await this.prisma.rooms.findMany({
      include: {
        provinces: true,
        districts: true,
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const statusPriority = {
      pending: 0,
      approved: 1,
      rejected: 2,
    };

    const sortedRooms = rooms.sort(
      (a, b) =>
        (statusPriority[a.status ?? 'rejected'] ?? 2) -
          (statusPriority[b.status ?? 'rejected'] ?? 2) ||
        b.id - a.id,
    );

    const data = sortedRooms.map((room) => ({
      ...room,
      city_name: room.provinces?.name ?? null,
      district_name: room.districts?.name ?? null,
      user: room.user
        ? {
            id: room.user.id,
            full_name: room.user.full_name,
            email: room.user.email,
            phone: room.user.phone,
            avatar: room.user.avatar,
          }
        : null,
    }));

    return {
      total: data.length,
      data,
    };
  }

  // 3. TẠO PHÒNG TRỌ MỚI (Trạng thái mặc định là pending chờ duyệt - Sử dụng Prisma)
  async createRoom(dto: CreateRoomDto, userId?: number) {
    const {
      title,
      price,
      area,
      city,
      district,
      content,
      thumbnail,
      images,
      amenities,
    } = dto;

    if (
      !title ||
      price === undefined ||
      area === undefined ||
      !city ||
      !district
    ) {
      throw new BadRequestException('Thiếu thông tin bắt buộc');
    }

    const room = await this.prisma.rooms.create({
      data: {
        title,
        price,
        area,
        city,
        district,
        content: content || null,
        thumbnail: thumbnail || null,
        images: images || [],
        amenities: amenities || [],
        user_id: userId || null,
        status: RoomStatus.pending,
      },
    });

    return room;
  }

  // 4. CẬP NHẬT PHÒNG TRỌ (Kiểm tra chính chủ + Diff chuẩn hóa + Thông báo thông minh)
  async updateRoom(id: string, dto: UpdateRoomDto, currentUserId: number) {
    // 4.1. Lấy room hiện tại bằng Prisma
    const oldRoom = await this.prisma.rooms.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!oldRoom) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

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

    const updatedRoom = await this.prisma.rooms.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        thumbnail: thumbnail || null,
        price,
        area,
        city,
        district,
        content: content || null,
        images: images || [],
        amenities: amenities || [],
      },
    });

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
        data: { status: status as RoomStatus },
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
