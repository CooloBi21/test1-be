require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database.js");

const roomRoutes = require("./src/routes/roomRoutes");
const provinceRoutes = require("./src/routes/provinceRoutes");
const districtRoutes = require("./src/routes/districtRoutes");

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(cors());

// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Phong Tro Backend is running!",
    });
});

// ========================================
// API
// ========================================

app.use("/api/rooms", roomRoutes);
app.use("/api/provinces", provinceRoutes);
app.use("/api/districts", districtRoutes);

// ========================================
// DATABASE
// ========================================

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("PostgreSQL connected:");
        console.log(result.rows[0]);
    })
    .catch((error) => {
        console.error("PostgreSQL connection error:");
        console.error(error);
    });

// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});