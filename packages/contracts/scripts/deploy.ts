import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Lottery contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();

  await lottery.waitForDeployment();

  const address = await lottery.getAddress();
  console.log("Lottery deployed to:", address);

  // Get initial round info
  const roundInfo = await lottery.getCurrentRoundInfo();
  console.log("\nInitial Round Info:");
  console.log("- Round ID:", roundInfo.roundId.toString());
  console.log("- Start Time:", new Date(Number(roundInfo.startTime) * 1000).toISOString());
  console.log("- End Time:", new Date(Number(roundInfo.endTime) * 1000).toISOString());
  console.log("- Prize Pool:", ethers.formatEther(roundInfo.prizePool), "ETH");
  console.log("- Is Active:", roundInfo.isActive);

  console.log("\nContract Configuration:");
  console.log("- Ticket Price:", ethers.formatEther(await lottery.TICKET_PRICE()), "ETH");
  console.log("- Max Tickets Per User:", (await lottery.MAX_TICKETS_PER_USER()).toString());
  console.log("- Draw Interval:", Number(await lottery.DRAW_INTERVAL()) / 86400, "days");
  console.log("- Platform Fee:", (await lottery.FEE_PERCENTAGE()).toString() + "%");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    address: address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: (await ethers.provider.getBlockNumber()).toString(),
  };

  const deploymentPath = "./deployments";
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }

  fs.writeFileSync(
    `${deploymentPath}/lottery-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to:", `${deploymentPath}/lottery-${network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });