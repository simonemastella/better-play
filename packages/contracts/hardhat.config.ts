import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { MAINNET_URL, TESTNET_URL } from "@vechain/sdk-network";
import { Hex, Mnemonic } from "@vechain/sdk-core";
import { env } from "./src/env";
import "@vechain/sdk-hardhat-plugin";

const vechain_pk = Hex.of(
  Mnemonic.toPrivateKey(env.MNEMONIC.split(" "))
).toString();

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
      accounts: [vechain_pk],
      gas: 10000000,
    },
    vechain_mainnet: {
      url: MAINNET_URL,
      accounts: [vechain_pk],
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
