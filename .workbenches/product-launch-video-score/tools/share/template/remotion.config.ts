import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// "@/..." imports in snapcn components resolve from the project root.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), "@": path.resolve(process.cwd()) },
  },
}));
// Inside the Workbench sandbox node_modules is read-only, so the webpack cache cannot be written.
if (process.env.LV_SANDBOX) Config.setCachingEnabled(false);
