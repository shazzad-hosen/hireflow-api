import applicationEmitter from "../events/application.events.js";
import applicationHistoryModel from "../models/applicationHistory.model.js";

applicationEmitter.on("application.statusChanged", async (data) => {
  try {
    await applicationHistoryModel.create({
      application: data.applicationId,
      user: data.userId,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
    });
  } catch (error) {
    console.log("Failed to log history:", error);
  }
});
