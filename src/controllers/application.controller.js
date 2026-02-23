import {
  createApplication,
  getApplications,
  getSingleApplication,
  updateApplication,
  deleteApplication,
  getAnalytics,
  getApplicationStats,
} from "../services/application.service.js";

export const createApplicationController = async (req, res) => {
  const application = await createApplication(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "Application created successfully",
    data: application,
  });
};

export const getApplicationsController = async (req, res) => {
  const result = await getApplications(req.user._id, req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getSingleApplicationController = async (req, res) => {
  const application = await getSingleApplication(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    data: application,
  });
};

export const updateApplicationController = async (req, res) => {
  const application = await updateApplication(
    req.user._id,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Application updated successfully",
    data: application,
  });
};

export const deleteApplicationController = async (req, res) => {
  const result = await deleteApplication(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getAnalyticsController = async (req, res) => {
  const analytics = await getAnalytics(req.user._id);

  res.status(200).json({
    success: true,
    data: analytics,
  });
};

export const getApplicationStatsController = async (req, res) => {
  const stats = await getApplicationStats(req.user.id);

  res.status(200).json({
    success: true,
    ...stats,
  });
};
