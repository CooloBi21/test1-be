import pool from "../config/database";

// Interface định nghĩa kiểu dữ liệu của bảng rooms trong DB
export interface RoomRow {
  id: number;
  title: string;
  thumbnail: string | null;
  price: number;
  area: number;
  city: string;
  district: string;
  content: string | null;
}

export const getAllRooms = async (): Promise<RoomRow[]> => {
  const result = await pool.query<RoomRow>(`
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