const express = require("express");
const router = express.Router();
const {
    getDistricts,
    getDistrictsByProvince
} = require("../controllers/districtController");

// GET tất cả quận/huyện
router.get("/", getDistricts);

// GET quận/huyện theo tỉnh/thành
router.get("/by-province", getDistrictsByProvince);

module.exports = router;