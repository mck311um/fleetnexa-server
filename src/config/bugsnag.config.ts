import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";

const bugsnagClient = Bugsnag.start({
  apiKey: process.env.BUGSNAG_API_KEY!,
  plugins: [BugsnagPluginExpress],
  appVersion: "1.0.0",
  releaseStage: process.env.NODE_ENV || "development",
  enabledReleaseStages: ["production"],
});

const bugsnagMiddleware = bugsnagClient.getPlugin("express");

export { bugsnagClient, bugsnagMiddleware };
