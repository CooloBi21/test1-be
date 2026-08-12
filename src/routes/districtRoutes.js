const express = require("express");

const router =
    express.Router();

const {
    getDistricts,
    getDistrictsByProvince
} = require(
    "../controllers/districtController"
);


// ========================================
// GET TẤT CẢ QUẬN / HUYỆN
// ========================================

router.get(
    "/",
    getDistricts
);

// ========================================
// GET QUẬN / HUYỆN THEO TỈNH
// ========================================

router.get(
    "/by-province",
    getDistrictsByProvince
);

module.exports = router;