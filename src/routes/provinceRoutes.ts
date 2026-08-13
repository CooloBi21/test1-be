import express, { Router } from "express";
import { getProvinces } from "../controllers/provinceController";

const router: Router = express.Router();

// GET /api/provinces
router.get("/", getProvinces);

export default router;