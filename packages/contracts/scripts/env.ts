// Simple CommonJS-compatible environment loader that works with Hardhat
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Re-export the local contracts environment type
export type { ContractsEnv as Env } from "../src/project-env";
import type { ContractsEnv } from "../src/project-env";

// Load environment using @better-play/shared package utilities
function loadEnvironment(): ContractsEnv {
  const envJsonPath = path.join(process.cwd(), '.env-loaded.json');

  // If cached file doesn't exist, run the loader script
  if (!fs.existsSync(envJsonPath)) {
    console.log("Loading environment using @better-play/shared...");
    execSync("npx tsx scripts/load-env.ts", { stdio: "inherit" });
  }

  // Read the cached environment
  return JSON.parse(fs.readFileSync(envJsonPath, 'utf8')) as ContractsEnv;
}

export const env = loadEnvironment();