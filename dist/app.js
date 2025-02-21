"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const StudentRoutes_1 = __importDefault(require("./routes/StudentRoutes"));
const AdminRoutes_1 = __importDefault(require("./routes/AdminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/student", StudentRoutes_1.default);
app.use("/api/admin", AdminRoutes_1.default);
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port " + process.env.PORT || 5000);
});
