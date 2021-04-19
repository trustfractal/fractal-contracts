import "@typechain/hardhat";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "hardhat-docgen";

import { HardhatUserConfig } from "hardhat/config";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: "0.8.3",
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: true,
  },
};

export default config;
