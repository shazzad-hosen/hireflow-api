import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import ApiError from "../utils/ApiError.js";
import applicationEmitter from "../events/application.events.js";
import { ApplicationHistory } from "../models/applicationHistory.model.js";
import {
  buildApplicationFilter,
  buildPagination,
  buildSort,
} from "../utils/applicationQueryBuilder.js";

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
  const filter = buildApplicationFilter(userId, query);
  const { page, limit, skip } = buildPagination(query);
  const sort = buildSort(query);

  const applications = await Application.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Application.countDocuments(filter);

  return {
    total,
    page,
    pages: Math.ceil(total / limit),
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

export const getApplicationAnalytics = async (userId) => {
  const objectUserId = new mongoose.Types.ObjectId(userId);

  const result = await Application.aggregate([
    {
      $match: {
        user: objectUserId,
        isDeleted: false,
      },
    },
    {
      $facet: {
        statusStats: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        monthlyApplications: [
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
        ],
      },
    },
  ]);

  const statusStats = result[0].statusStats;
  const monthlyApplications = result[0].monthlyApplications;

  const byStatus = {};
  let total = 0;

  statusStats.forEach((item) => {
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
  const rejectionRate = total ? ((rejected / total) * 100).toFixed(2) : 0;

  return {
    total,
    active: total - rejected,
    rejected,
    byStatus,
    monthlyApplications,
    metrics: {
      interviewRate: Number(interviewRate),
      offerRate: Number(offerRate),
      acceptanceRate: Number(acceptanceRate),
      rejectionRate: Number(rejectionRate),
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

  const history = await ApplicationHistory.find({
    application: applicationId,
    user: userId,
  })
    .sort({ createdAt: 1 })
    .lean();

  return history;
};
