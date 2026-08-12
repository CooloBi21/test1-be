const express = require("express");
const router = express.Router();
const {
    getProvinces
} = require("../controllers/provinceController");

// GET /api/provinces
router.get("/", getProvinces);

module.exports = router;