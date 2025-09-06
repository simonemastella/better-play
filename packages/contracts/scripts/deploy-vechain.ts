#!/usr/bin/env ts-node
import hre from "hardhat";
import { env } from "./env";

const { ethers, network } = hre;

async function main() {
  const networkName = network.name;

  if (networkName !== "vechain_testnet") {
    throw new Error(
      `This script is only for VeChain testnet deployment. Current network: ${networkName}`
    );
  }

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account available");
  }

  console.log("🚀 VECHAIN TESTNET DEPLOYMENT");
  console.log("📝 Deployer account:", deployer.address);
  console.log("🔢 Current block:", await ethers.provider.getBlockNumber());
  console.log("─".repeat(60));

  console.log("📋 Deployment Parameters:");
  console.log(
    `  • X_ALLOCATION_VOTING_ADDRESS: ${env.X_ALLOCATION_VOTING_ADDRESS}`
  );
  console.log(
    `  • PAYMENT_TOKEN_ADDRESS: ${env.PAYMENT_TOKEN_ADDRESS || "Not set"}`
  );
  console.log(
    `  • INITIAL_TICKET_PRICE: ${env.INITIAL_TICKET_PRICE || "Not set"}`
  );
  console.log(`  • INITIAL_PRIZES: ${env.INITIAL_PRIZES || "Not set"}`);
  console.log("─".repeat(60));

  // Deploy Lottery Contract
  console.log("🎰 Deploying Lottery Contract...");
  const LotteryFactory = await ethers.getContractFactory("Lottery");

  const lottery = await LotteryFactory.deploy(
    env.X_ALLOCATION_VOTING_ADDRESS,
    env.PAYMENT_TOKEN_ADDRESS,
    env.INITIAL_TICKET_PRICE,
    env.INITIAL_PRIZES.split(",").map((p) => p.trim()),
    {
      gasLimit: 6000000, // High gas limit for deployment
    }
  );

  console.log("⏳ Waiting for deployment...");
  await lottery.waitForDeployment();

  const lotteryAddress = await lottery.getAddress();
  console.log(`🎉 Lottery deployed successfully at: ${lotteryAddress}`);
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ VeChain deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

export default main;
