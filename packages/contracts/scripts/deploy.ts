import { ethers, hardhatArguments } from "hardhat";
import { env } from "../src/env";

async function main() {
  const signers = await ethers.getSigners();
  console.log(`Deployng with address: ${signers.at(0)?.address}`);
  const lottery = await ethers.deployContract("Lottery", [
    env.X_ALLOCATION_VOTING_ADDRESS,
    env.PAYMENT_TOKEN_ADDRESS,
    env.INITIAL_TICKET_PRICE,
    env.INITIAL_PRIZES.split(",").map((p) => p.trim()),
  ]);
  await lottery.waitForDeployment();
  console.log(`🚀 Lottery deployed to: ${await lottery.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
