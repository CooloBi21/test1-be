import { Request, Response } from "express";
import pool from "../config/database";

// Interface định nghĩa Query Params khi lọc phòng
interface RoomQueryParams {
  city?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
}

// Interface Body khi tạo/sửa phòng
interface RoomRequestBody {
  title?: string;
  thumbnail?: string;
  price?: number;
  area?: number;
  city?: string;
  district?: string;
  content?: string;
}

// ==================================================
// GET ALL ROOMS
// GET /api/rooms
// ==================================================
export const getRooms = async (req: Request<{}, {}, {}, RoomQueryParams>, res: Response): Promise<Response | void> => {
  try {
    const {
      city,
      district,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
    } = req.query;

    let query = `
      SELECT *
      FROM rooms
      WHERE 1 = 1
    `;

    const values: (string | number)[] = [];
    let index = 1;

    // FILTER CITY
    if (city) {
      query += ` AND city = $${index}`;
      values.push(city);
      index++;
    }

    // FILTER DISTRICT
    if (district) {
      query += ` AND district = $${index}`;
      values.push(district);
      index++;
    }

    // FILTER MIN PRICE
    if (minPrice !== undefined) {
      query += ` AND price >= $${index}`;
      values.push(Number(minPrice));
      index++;
    }

    // FILTER MAX PRICE
    if (maxPrice !== undefined) {
      query += ` AND price <= $${index}`;
      values.push(Number(maxPrice));
      index++;
    }

    // FILTER MIN AREA
    if (minArea !== undefined) {
      query += ` AND area >= $${index}`;
      values.push(Number(minArea));
      index++;
    }

    // FILTER MAX AREA
    if (maxArea !== undefined) {
      query += ` AND area <= $${index}`;
      values.push(Number(maxArea));
      index++;
    }

    // SORT
    query += ` ORDER BY id DESC`;

    // QUERY DATABASE
    const result = await pool.query(query, values);

    // RESPONSE
    return res.json({
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách phòng",
    });
  }
};

// ==================================================
// GET ROOM BY ID
// GET /api/rooms/:id
// ==================================================
export const getRoomById = async (req: Request<{ id: string }>, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM rooms
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phòng",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get room by id error:", error);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// ==================================================
// CREATE ROOM
// POST /api/rooms
// ==================================================
export const createRoom = async (req: Request<{}, {}, RoomRequestBody>, res: Response): Promise<Response | void> => {
  try {
    const {
      title,
      thumbnail,
      price,
      area,
      city,
      district,
      content,
    } = req.body;

    // VALIDATE
    if (
      !title ||
      price === undefined ||
      area === undefined ||
      !city ||
      !district
    ) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // INSERT
    const result = await pool.query(
      `
      INSERT INTO rooms (
        title,
        thumbnail,
        price,
        area,
        city,
        district,
        content
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
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
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({
      message: "Không thể tạo phòng",
    });
  }
};

// ==================================================
// UPDATE ROOM
// PUT /api/rooms/:id
// ==================================================
export const updateRoom = async (req: Request<{ id: string }, {}, RoomRequestBody>, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      title,
      thumbnail,
      price,
      area,
      city,
      district,
      content,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE rooms
      SET
        title = $1,
        thumbnail = $2,
        price = $3,
        area = $4,
        city = $5,
        district = $6,
        content = $7
      WHERE id = $8
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
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phòng",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({
      message: "Không thể cập nhật phòng",
    });
  }
};

// ==================================================
// DELETE ROOM
// DELETE /api/rooms/:id
// ==================================================
export const deleteRoom = async (req: Request<{ id: string }>, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM rooms
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phòng",
      });
    }

    return res.json({
      message: "Xóa phòng thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      message: "Không thể xóa phòng",
    });
  }
};