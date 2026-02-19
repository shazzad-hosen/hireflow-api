import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RefreshToken } from "../models/refreshToken.model.js";
import ApiError from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

const verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(new ApiError(401, "Refresh token missing"));
  }

  try {
    const decoded = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const existingToken = RefreshToken.findOne({
      token: hashedToken,
    });

    if (!existingToken || existingToken.revoked) {
      await RefreshToken.deleteMany({ user: decoded.id });
      return next(new ApiError(403, "Token compromised. Please login again."));
    }

    if (existingToken.expiresAt < Date.now()) {
      await tokenDoc.deleteOne();
      return next(new ApiError(401, "Refresh token expired"));
    }

    req.user = { id: decoded.id };
    req.refreshToken = existingToken;
    next();
  } catch (error) {
    return next(new ApiError(401, 401, "Invalid or expired session"));
  }
};

export default verifyRefreshToken;
