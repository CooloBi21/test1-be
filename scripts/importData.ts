import "dotenv/config";
import { Pool } from "pg";

import roomsData from "../src/data/room.json";
import provincesData from "../src/data/tinh_tp.json";
import districtsData from "../src/data/quan_huyen.json";

// Cấu hình kết nối PostgreSQL trực tiếp từ .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Interface cho cấu trúc dữ liệu Tỉnh/Thành
interface ProvinceInput {
  code: string | number;
  name: string;
  [key: string]: any;
}

// Interface cho cấu trúc dữ liệu Quận/Huyện
interface DistrictInput {
  code: string | number;
  name: string;
  parent_code?: string | number;
  province_code?: string | number;
  parentCode?: string | number;
  [key: string]: any;
}

// Interface cho cấu trúc dữ liệu Phòng trọ
interface RoomInput {
  title: string;
  thumbnail?: string | null;
  price: number | string;
  area: number | string;
  city: string | number;
  district: string | number;
  content?: string | null;
}

const importData = async (): Promise<void> => {
  try {
    console.log("=================================");
    console.log("BẮT ĐẦU IMPORT DATA");
    console.log("=================================");

    // =====================================
    // 1. IMPORT PROVINCES
    // =====================================
    console.log("\n1. Import provinces...");

    const provinces: ProvinceInput[] = Array.isArray(provincesData)
      ? (provincesData as ProvinceInput[])
      : (Object.values(provincesData) as ProvinceInput[]);

    for (const province of provinces) {
      await pool.query(
        `
        INSERT INTO provinces (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name
        `,
        [String(province.code), province.name]
      );
    }

    console.log(`Đã import ${provinces.length} provinces`);

    // =====================================
    // 2. IMPORT DISTRICTS
    // =====================================
    console.log("\n2. Import districts...");

    const districts: DistrictInput[] = Array.isArray(districtsData)
      ? (districtsData as DistrictInput[])
      : (Object.values(districtsData) as DistrictInput[]);

    for (const district of districts) {
      const parentCode =
        district.parent_code ||
        district.province_code ||
        district.parentCode ||
        "";

      await pool.query(
        `
        INSERT INTO districts (code, name, parent_code)
        VALUES ($1, $2, $3)
        ON CONFLICT (code)
        DO UPDATE SET
          name = EXCLUDED.name,
          parent_code = EXCLUDED.parent_code
        `,
        [String(district.code), district.name, String(parentCode)]
      );
    }

    console.log(`Đã import ${districts.length} districts`);

    // =====================================
    // 3. IMPORT ROOMS
    // =====================================
    console.log("\n3. Import rooms...");

    const rooms: RoomInput[] = roomsData as RoomInput[];
    console.log("roomsData is array:", Array.isArray(rooms));
    console.log("rooms count:", rooms.length);

    for (const room of rooms) {
      await pool.query(
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
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          room.title,
          room.thumbnail || null,
          Number(room.price),
          Number(room.area),
          String(room.city),
          String(room.district),
          room.content || null,
        ]
      );
    }

    console.log(`Đã import ${rooms.length} rooms`);

    console.log("\n=================================");
    console.log("IMPORT DATA THÀNH CÔNG");
    console.log("=================================");
  } catch (error) {
    console.error("\nIMPORT DATA ERROR:");
    console.error(error);
  } finally {
    await pool.end();
  }
};

importData();