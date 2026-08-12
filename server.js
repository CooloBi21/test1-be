require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database.js");

const roomRoutes = require("./src/routes/roomRoutes");
const provinceRoutes = require("./src/routes/provinceRoutes");
const districtRoutes = require("./src/routes/districtRoutes");

// 1. IMPORT SWAGGER
const { setupSwagger } = require("./src/config/swagger");

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(cors());

// ========================================
// SWAGGER DOCS
// ========================================

setupSwagger(app);

// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Phong Tro Backend is running!",
        swaggerDocs: "http://localhost:5000/api-docs"
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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});