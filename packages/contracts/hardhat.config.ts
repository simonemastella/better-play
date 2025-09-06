import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HDKey, Hex } from "@vechain/sdk-core";
import "@vechain/sdk-hardhat-plugin";
import { ethers } from "ethers";

import { env } from "./scripts/env";

const vechain_pk_buff = Hex.of(
  HDKey.fromMnemonic(env.MNEMONIC.split(" ")).deriveChild(0)
    .privateKey!
).toString();
console.log(env.MNEMONIC);
const base_pk_buff = ethers.Wallet.fromPhrase(env.MNEMONIC).privateKey;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    vechain_testnet: {
      url: "https://testnet.vechain.org",
      accounts: [vechain_pk_buff],
    },
  },
};

export default config;
