import pool from "../config/database.js";

export const getAllDistricts = async () => {
    const result = await pool.query(`
        SELECT code, name, parent_code
        FROM districts
        ORDER BY name
    `);

    return result.rows;
};

export const getDistrictsByProvince = async (parentCode) => {
    const result = await pool.query(
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