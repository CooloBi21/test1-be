import { Request, Response } from "express";
import { getAllProvinces } from "../services/provinceService";

export const getProvinces = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const provinces = await getAllProvinces();
    return res.json(provinces);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Không thể lấy danh sách tỉnh/thành",
    });
  }
};