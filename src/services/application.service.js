import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import ApiError from "../utils/ApiError.js";
import applicationEmitter from "../events/application.events.js";
import ApplicationHistory from "../models/applicationHistory.model.js";

// Status transition rules
const allowedTransitions = {
  APPLIED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
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

  const filter = { user: userId, isDeleted: false };

  if (status) {
    filter.status = status;
  }

  if (company) {
    filter.companyName = { $regex: company, $options: "i" };
  }

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
    isDeleted: false,
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  let statusChanged = false;
  let previousStatus = existing.status;

  if (data.status && data.status !== existing.status) {
    const allowed = allowedTransitions[existing.status] || [];

    if (!allowed.includes(data.status)) {
      throw new ApiError(
        400,
        `Invalid transition: ${existing.status} to ${data.status}`,
      );
    }

    statusChanged = true;
  }

  const updated = await Application.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: data },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (statusChanged) {
    applicationEmitter.emit("application.statusChanged", {
      applicationId: updated._id,
      userId,
      previousStatus,
      newStatus: updated.status,
    });
  }

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

export const getApplicationStats = async (userId) => {
  const stats = await Application.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const byStatus = {};
  let total = 0;

  stats.forEach((item) => {
    byStatus[item._id] = item.count;
    total += item.count;
  });

  const interviews = byStatus.INTERVIEW || 0;
  const offers = byStatus.OFFER || 0;
  const accepted = byStatus.ACCEPTED || 0;
  const rejected = byStatus.REJECTED || 0;

  const interviewRate = total ? ((interviews / total) * 100).toFixed(2) : 0;

  const offerRate = total ? ((offers / total) * 100).toFixed(2) : 0;

  const acceptanceRate = offers ? ((accepted / offers) * 100).toFixed(2) : 0;

  return {
    total,
    active: total - rejected,
    rejected,
    byStatus,
    metrics: {
      interviewRate: Number(interviewRate),
      offerRate: Number(offerRate),
      acceptanceRate: Number(acceptanceRate),
    },
  };
};

export const getApplicationHistory = async (userId, applicationId) => {
  const application = await Application.findOne({
    _id: applicationId,
    user: userId,
    isDeleted: false,
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const history = await ApplicationHistory.findOne({
    application: applicationId,
    user: userId,
  })
    .sort({ createdAt: 1 })
    .lean();

  return history;
};
