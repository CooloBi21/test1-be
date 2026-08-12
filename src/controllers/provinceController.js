import { getAllProvinces } from "../services/provinceService.js";

export const getProvinces = async (req, res) => {
    try {
        const provinces = await getAllProvinces();

        res.json(provinces);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể lấy danh sách tỉnh/thành",
        });
    }
};