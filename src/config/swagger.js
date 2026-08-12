const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Rental Rooms & Locations API",
    version: "1.0.0",
    description: "Tài liệu và giao diện thử nghiệm API cho bài test Front-End Developer",
  },
  servers: [
    {
      url: "https://test1-be-845w.onrender.com",
      description: "Production Server (Render)",
    },
    {
      url: "http://localhost:5000",
      description: "Local Server",
    },
  ],
  paths: {
    "/api/provinces": {
      get: {
        summary: "Lấy danh sách tất cả Tỉnh / Thành phố",
        tags: ["Locations"],
        responses: {
          200: { description: "Thành công" },
        },
      },
    },
    "/api/districts/by-province": {
      get: {
        summary: "Lấy danh sách Quận / Huyện theo Tỉnh / Thành",
        tags: ["Locations"],
        parameters: [
          {
            name: "parentCode",
            in: "query",
            required: true,
            description: "Mã tỉnh/thành (Ví dụ: 01 cho Hà Nội, 79 cho TP.HCM)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Thành công" },
        },
      },
    },
    "/api/rooms": {
      get: {
        summary: "Lấy danh sách phòng trọ (Hỗ trợ lọc dữ liệu)",
        tags: ["Rooms"],
        parameters: [
          { name: "city", in: "query", schema: { type: "string" }, description: "Mã tỉnh thành" },
          { name: "district", in: "query", schema: { type: "string" }, description: "Mã quận huyện" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Giá tối thiểu (VNĐ)" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Giá tối đa (VNĐ)" },
          { name: "minArea", in: "query", schema: { type: "number" }, description: "Diện tích tối thiểu (m²)" },
          { name: "maxArea", in: "query", schema: { type: "number" }, description: "Diện tích tối đa (m²)" },
        ],
        responses: {
          200: { description: "Thành công" },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = { setupSwagger };