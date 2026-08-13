import pool from "../config/database";

// Interface định nghĩa kiểu dữ liệu của bảng provinces
export interface ProvinceRow {
  code: string;
  name: string;
}

export const getAllProvinces = async (): Promise<ProvinceRow[]> => {
  const result = await pool.query<ProvinceRow>(`
    SELECT code, name
    FROM provinces
    ORDER BY name
  `);

  return result.rows;
};