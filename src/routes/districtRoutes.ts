import express, { Router } from "express";
import {
  getDistricts,
  getDistrictsByProvince,
} from "../controllers/districtController";

const router: Router = express.Router();

// ========================================
// GET TẤT CẢ QUẬN / HUYỆN
// ========================================
router.get("/", getDistricts);

// ========================================
// GET QUẬN / HUYỆN THEO TỈNH
// ========================================
router.get("/by-province", getDistrictsByProvince);

export default router;