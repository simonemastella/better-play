import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@vechain/hardhat-vechain";
import { MAINNET_URL, TESTNET_URL } from "@vechain/sdk-network";
import { env } from "./src/env";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    vechain_testnet: {
      url: TESTNET_URL,
      accounts: [env.VECHAIN_PRIVATE_KEY],
      gas: 10000000,
    },
    vechain_mainnet: {
      url: MAINNET_URL,
      accounts: [env.VECHAIN_PRIVATE_KEY],
      gas: 10000000,
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
