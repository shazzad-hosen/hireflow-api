import applicationEmitter from "../events/application.events.js";
import ApplicationHistory from "../models/applicationHistory.model.js";

applicationEmitter.on("application.statusChanged", async (data) => {
  try {
    await ApplicationHistory.create({
      application: data.applicationId,
      user: data.userId,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
    });
  } catch (error) {
    console.log("Failed to log history:", error);
  }
});
