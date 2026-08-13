import pool from "../config/database";

// Interface định nghĩa kiểu dữ liệu của bảng districts
export interface DistrictRow {
  code: string;
  name: string;
  parent_code: string;
}

export const getAllDistricts = async (): Promise<DistrictRow[]> => {
  const result = await pool.query<DistrictRow>(`
    SELECT code, name, parent_code
    FROM districts
    ORDER BY name
  `);

  return result.rows;
};

export const getDistrictsByProvince = async (
  parentCode: string | number
): Promise<DistrictRow[]> => {
  const result = await pool.query<DistrictRow>(
    `
    SELECT code, name, parent_code
    FROM districts
    WHERE parent_code = $1
    ORDER BY name
    `,
    [parentCode]
  );

  return result.rows;
};