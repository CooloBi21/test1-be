"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvinces = void 0;
const provinceService_1 = require("../services/provinceService");
const getProvinces = async (req, res) => {
    try {
        const provinces = await (0, provinceService_1.getAllProvinces)();
        return res.json(provinces);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Không thể lấy danh sách tỉnh/thành",
        });
    }
};
exports.getProvinces = getProvinces;
