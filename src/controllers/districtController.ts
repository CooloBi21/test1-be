import { Request, Response } from "express";
import districtsData from "../data/quan_huyen.json";

interface DistrictItem {
  code?: string | number;
  parent_code?: string | number;
  name?: string;
  name_with_type?: string;
  [key: string]: any;
}

const getDistrictList = (): DistrictItem[] => {
  return Array.isArray(districtsData)
    ? (districtsData as DistrictItem[])
    : (Object.values(districtsData) as DistrictItem[]);
};

// ========================================
// GET ALL DISTRICTS
// ========================================
export const getDistricts = (req: Request, res: Response): void => {
  const districts = getDistrictList();
  res.json(districts);
};

// ========================================
// GET DISTRICTS BY PROVINCE
// ========================================
export const getDistrictsByProvince = (req: Request, res: Response): Response | void => {
  const { parentCode } = req.query;

  // VALIDATE
  if (!parentCode) {
    return res.status(400).json({
      message: "parentCode là bắt buộc",
    });
  }

  // FILTER
  const districts = getDistrictList().filter(
    (district) => String(district.parent_code) === String(parentCode)
  );

  // RESPONSE
  return res.json(districts);
};