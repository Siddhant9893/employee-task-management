import cron, { ScheduledTask } from "node-cron";
import { createDueTomorrowNotifications } from "../services/notification.service";

let notificationJob: ScheduledTask | null = null;

export const startNotificationJob = () => {
  if (notificationJob) {
    return notificationJob;
  }

  notificationJob = cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const created = await createDueTomorrowNotifications();
        console.log(`Created ${created} due-date notifications`);
      } catch (error) {
        console.error("Failed to create due-date notifications", error);
      }
    },
    {
      name: "due-tomorrow-notifications",
      noOverlap: true,
    }
  );

  return notificationJob;
};
