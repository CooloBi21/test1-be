"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const room_json_1 = __importDefault(require("../src/data/room.json"));
const tinh_tp_json_1 = __importDefault(require("../src/data/tinh_tp.json"));
const quan_huyen_json_1 = __importDefault(require("../src/data/quan_huyen.json"));
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
    },
});
const importData = async () => {
    try {
        console.log("=================================");
        console.log("BẮT ĐẦU IMPORT DATA");
        console.log("=================================");
        console.log("\n1. Import provinces...");
        const provinces = Array.isArray(tinh_tp_json_1.default)
            ? tinh_tp_json_1.default
            : Object.values(tinh_tp_json_1.default);
        for (const province of provinces) {
            await pool.query(`
        INSERT INTO provinces (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name
        `, [String(province.code), province.name]);
        }
        console.log(`Đã import ${provinces.length} provinces`);
        console.log("\n2. Import districts...");
        const districts = Array.isArray(quan_huyen_json_1.default)
            ? quan_huyen_json_1.default
            : Object.values(quan_huyen_json_1.default);
        for (const district of districts) {
            const parentCode = district.parent_code ||
                district.province_code ||
                district.parentCode ||
                "";
            await pool.query(`
        INSERT INTO districts (code, name, parent_code)
        VALUES ($1, $2, $3)
        ON CONFLICT (code)
        DO UPDATE SET
          name = EXCLUDED.name,
          parent_code = EXCLUDED.parent_code
        `, [String(district.code), district.name, String(parentCode)]);
        }
        console.log(`Đã import ${districts.length} districts`);
        console.log("\n3. Import rooms...");
        const rooms = room_json_1.default;
        console.log("roomsData is array:", Array.isArray(rooms));
        console.log("rooms count:", rooms.length);
        for (const room of rooms) {
            await pool.query(`
        INSERT INTO rooms (
          title,
          thumbnail,
          price,
          area,
          city,
          district,
          content
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
                room.title,
                room.thumbnail || null,
                Number(room.price),
                Number(room.area),
                String(room.city),
                String(room.district),
                room.content || null,
            ]);
        }
        console.log(`Đã import ${rooms.length} rooms`);
        console.log("\n=================================");
        console.log("IMPORT DATA THÀNH CÔNG");
        console.log("=================================");
    }
    catch (error) {
        console.error("\nIMPORT DATA ERROR:");
        console.error(error);
    }
    finally {
        await pool.end();
    }
};
importData();
//# sourceMappingURL=importData.js.map