"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./app/routes"));
const assignmentError_1 = require("./app/middlewares/assignmentError");
const swagger_1 = require("./app/config/swagger");
const swagger_2 = require("./app/config/swagger");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_2.swaggerSpec));
// app.get("/", (_req, res) => {
//   res.status(200).json({ message: "Assignment API is running." });
// });
// app.use("/", router);
app.use("/api/v1", routes_1.default);
app.use(assignmentError_1.assignmentNotFound);
app.use(assignmentError_1.assignmentErrorHandler);
exports.default = app;
