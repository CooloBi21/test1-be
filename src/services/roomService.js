import pool from "../config/database.js";

export const getAllRooms = async () => {
    const result = await pool.query(`
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