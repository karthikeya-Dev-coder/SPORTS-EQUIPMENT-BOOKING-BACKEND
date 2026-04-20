import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "../src/frameworks/express/server";
import { initializeDatabase } from "../src/infrastructure/database/dataSource";
import { scheduledOverdueCheck } from "./scheduledOverdueCheck";

// Initialize the database on first request
let appPromise: Promise<any> | null = null;

const getApp = async () => {
  if (!appPromise) {
    appPromise = (async () => {
      await initializeDatabase();
      return await createApp();
    })();
  }
  return appPromise;
};

// Export the API function
export const api = onRequest(async (req, res) => {
  const app = await getApp();
  return app(req, res);
});

// Export the scheduled function
export { scheduledOverdueCheck };
