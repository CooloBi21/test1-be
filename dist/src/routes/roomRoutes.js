"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controllers/roomController");
const router = express_1.default.Router();
router.get("/", roomController_1.getRooms);
router.get("/:id", roomController_1.getRoomById);
router.post("/", roomController_1.createRoom);
router.put("/:id", roomController_1.updateRoom);
router.delete("/:id", roomController_1.deleteRoom);
exports.default = router;
