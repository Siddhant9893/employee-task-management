import "./config/env";
import app from "./app";
import { startNotificationJob } from "./jobs/notification.job";

const PORT = process.env.PORT || 5000;

startNotificationJob();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
