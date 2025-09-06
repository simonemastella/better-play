// Helper script to load env using shared package and make it available to hardhat config
import { loadContractsEnv, type ContractsEnv } from "../src/project-env";
import fs from "fs";

// Load env using contracts-specific environment
const env: ContractsEnv = loadContractsEnv();

// Write it to a temp file that hardhat can import
fs.writeFileSync('.env-loaded.json', JSON.stringify(env, null, 2));

console.log("Environment loaded using @better-play/shared");