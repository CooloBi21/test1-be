import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";

import pool from "./src/config/database";
import roomRoutes from "./src/routes/roomRoutes";
import provinceRoutes from "./src/routes/provinceRoutes";
import districtRoutes from "./src/routes/districtRoutes";
import { setupSwagger } from "./src/config/swagger";

const app: Express = express();

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

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Phong Tro Backend is running!",
    swaggerDocs: `http://localhost:${process.env.PORT || 5000}/api-docs`,
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
  .catch((error: Error) => {
    console.error("PostgreSQL connection error:");
    console.error(error);
  });

// ========================================
// SERVER
// ========================================

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});