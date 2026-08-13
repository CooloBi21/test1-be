"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./src/config/database"));
const roomRoutes_1 = __importDefault(require("./src/routes/roomRoutes"));
const provinceRoutes_1 = __importDefault(require("./src/routes/provinceRoutes"));
const districtRoutes_1 = __importDefault(require("./src/routes/districtRoutes"));
const swagger_1 = require("./src/config/swagger");
const app = (0, express_1.default)();
// ========================================
// MIDDLEWARE
// ========================================
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// ========================================
// SWAGGER DOCS
// ========================================
(0, swagger_1.setupSwagger)(app);
// ========================================
// ROOT
// ========================================
app.get("/", (req, res) => {
    res.json({
        message: "Phong Tro Backend is running!",
        swaggerDocs: `http://localhost:${process.env.PORT || 5000}/api-docs`,
    });
});
// ========================================
// API
// ========================================
app.use("/api/rooms", roomRoutes_1.default);
app.use("/api/provinces", provinceRoutes_1.default);
app.use("/api/districts", districtRoutes_1.default);
// ========================================
// DATABASE
// ========================================
database_1.default.query("SELECT NOW()")
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
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
