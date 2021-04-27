import "@typechain/hardhat";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "hardhat-gas-reporter";
import "hardhat-docgen";

import { HardhatUserConfig } from "hardhat/config";

const {
  ALCHEMY_API_KEY,
  ROPSTEN_MNEMONIC,
  MAINNET_MNEMONIC,
  GANACHE_MNEMONIC,
  CMC_API_KEY,
} = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: true,
  },
  gasReporter: {
    currency: "EUR",
    gasPrice: 62,
    coinmarketcap: CMC_API_KEY,
  },
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic: ROPSTEN_MNEMONIC,
      },
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: {
        mnemonic: GANACHE_MNEMONIC,
      },
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic: MAINNET_MNEMONIC,
      },
    },
  },
};

export default config;
