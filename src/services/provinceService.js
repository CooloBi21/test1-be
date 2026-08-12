import pool from "../config/database.js";

export const getAllProvinces = async () => {
    const result = await pool.query(`
        SELECT code, name
        FROM provinces
        ORDER BY name
    `);

    return result.rows;
};