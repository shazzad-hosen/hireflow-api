import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  let token;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized, token missing"));
  }

  try {
    let decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ApiError(401, "User no longer exists"));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

export default protect;
