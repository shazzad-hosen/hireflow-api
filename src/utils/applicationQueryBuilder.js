import mongoose from "mongoose";

export const buildApplicationFilter = (userId, query = {}) => {
  const { status, company, search, startDate, endDate } = query;

  const filter = {
    user: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
  };

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

  return filter;
};

export const buildPagination = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const buildSort = (query = {}) => {
  const allowedSortFields = ["createdAt", "appliedAt", "companyName", "status"];

  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";

  const order = query.order === "asc" ? 1 : -1;

  return { [sortBy]: order };
};
