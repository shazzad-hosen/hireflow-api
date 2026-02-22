import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import ApiError from "../utils/ApiError.js";

// Status transition rules
const allowedTransitions = {
  APPLIED: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
};

export const createApplication = async (userId, data) => {
  return await Application.create({
    ...data,
    user: userId,
  });
};

export const getApplications = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    status,
    company,
    search,
    startDate,
    endDate,
    sortBy = "createdAt",
    order = "desc",
  } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = { user: userId };

  if (status) filter.status = status;
  if (company) filter.companyName = { $regex: company, $options: "i" };

  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { jobTitle: { $regex: search, $options: "i" } },
    ];
  }

  if (startDate || endDate) {
    filter.appliedAt = {};
    if (startDate) filter.appliedAt.$gte = new Date(startDate);
    if (endDate) filter.appliedAt.$lte = new Date(endDate);
  }

  const allowedSortFields = ["createdAt", "appliedAt", "companyName", "status"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const applications = await Application.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const total = await Application.countDocuments(filter);

  return {
    total,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    data: applications,
  };
};

export const getSingleApplication = async (userId, id) => {
  const application = await Application.findOne({
    _id: id,
    user: userId,
  }).lean();

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  return application;
};

export const updateApplication = async (userId, id, data) => {
  const existing = await Application.findOne({
    _id: id,
    user: userId,
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  if (data.status && data.status !== existing.status) {
    const allowed = allowedTransitions[existing.status] || [];
    if (!allowed.includes(data.status)) {
      throw new ApiError(
        400,
        `Invalid transition: ${existing.status} -> ${data.status}`,
      );
    }
  }

  const updated = await Application.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );

  return updated;
};

export const deleteApplication = async (userId, id) => {
  const result = await Application.updateOne(
    { _id: id, user: userId, isDeleted: { $ne: true } },
    { isDeleted: true },
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Application not found or already deleted");
  }

  return { message: "Application moved to trash" };
};

export const getAnalytics = async (userId) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);

  const total = await Application.countDocuments({ user: objectUserId });

  const statusCounts = await Application.aggregate([
    { $match: { user: objectUserId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const monthlyApplications = await Application.aggregate([
    { $match: { user: objectUserId } },
    {
      $group: {
        _id: {
          year: { $year: "$appliedAt" },
          month: { $month: "$appliedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  return {
    total,
    statusBreakdown: statusCounts,
    monthlyApplications,
  };
};
