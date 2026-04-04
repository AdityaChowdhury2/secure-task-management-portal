import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import { swaggerUi } from "./app/config/swagger";
import { swaggerSpec } from "./app/config/swagger";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app: Application = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://secure-task-management-portal-aditya.vercel.app",
    ], // ❗ NOT '*'
    credentials: true, // required
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
