import express from "express";
import authRoutes from "./routes/auth.routes.js";
import ApiError from "./utils/ApiError.js";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import applicationRoutes from "./routes/application.routes.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { ENV } from "./config/env.js";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running successfully" });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

// Request handler for invalid(404) routes
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Centralized error handler
app.use(errorHandler);

export default app;
