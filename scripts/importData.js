require("dotenv").config();

const pool = require("../src/config/database");

const roomsData = require("../src/data/room.json");
const provincesData = require("../src/data/tinh_tp.json");
const districtsData = require("../src/data/quan_huyen.json");


const importData = async () => {

    try {

        console.log("=================================");
        console.log("BẮT ĐẦU IMPORT DATA");
        console.log("=================================");


        // =====================================
        // 1. IMPORT PROVINCES
        // =====================================

        console.log("\n1. Import provinces...");

        const provinces = Array.isArray(provincesData)
            ? provincesData
            : Object.values(provincesData);


        for (const province of provinces) {

            await pool.query(
                `
                INSERT INTO provinces (code, name)
                VALUES ($1, $2)
                ON CONFLICT (code)
                DO UPDATE SET name = EXCLUDED.name
                `,
                [
                    String(province.code),
                    province.name
                ]
            );

        }

        console.log(
            `Đã import ${provinces.length} provinces`
        );


        // =====================================
        // 2. IMPORT DISTRICTS
        // =====================================

        console.log("\n2. Import districts...");

        const districts = Array.isArray(districtsData)
            ? districtsData
            : Object.values(districtsData);


        for (const district of districts) {

            const parentCode =
                district.parent_code ||
                district.province_code ||
                district.parentCode;


            await pool.query(
                `
                INSERT INTO districts
                (
                    code,
                    name,
                    parent_code
                )
                VALUES ($1, $2, $3)

                ON CONFLICT (code)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    parent_code = EXCLUDED.parent_code
                `,
                [
                    String(district.code),
                    district.name,
                    String(parentCode)
                ]
            );

        }

        console.log(
            `Đã import ${districts.length} districts`
        );


        // =====================================
        // 3. IMPORT ROOMS
        // =====================================

        console.log("\n3. Import rooms...");
        console.log("roomsData is array:", Array.isArray(roomsData));
        console.log("rooms count:", roomsData.length);

        for (const room of roomsData) {

            await pool.query(
                `
                INSERT INTO rooms
                (
                    title,
                    thumbnail,
                    price,
                    area,
                    city,
                    district,
                    content
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )
                `,
                [
                    room.title,
                    room.thumbnail,
                    Number(room.price),
                    Number(room.area),
                    String(room.city),
                    String(room.district),
                    room.content
                ]
            );

        }

        console.log(
            `Đã import ${roomsData.length} rooms`
        );


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