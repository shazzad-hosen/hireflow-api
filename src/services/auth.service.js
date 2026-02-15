import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
