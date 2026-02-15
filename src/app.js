import express from "express";
import ApiError from "./utils/ApiError.js";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running successfully" });
});

app.use("/api/auth", authRoutes);

// Request handler for invalid(404) routes
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Centralized error handler
app.use(errorHandler);

export default app;
