import { ethers, network } from "hardhat";
import dayjs from "dayjs";

const { parseEther } = ethers.utils;
const { env, exit } = process;

interface Contract {
  address: string;
}

const config: Record<string, any> = {
  ropsten: {
    fcl: env.ROPSTEN_FCL,
    lp: env.ROPSTEN_FCL_ETH_LP,
    issuer: env.ROPSTEN_FRACTAL_ISSUER,
    start: dayjs("2021-04-25T12:00:00.000Z").unix(),
    end: dayjs("2021-04-25T12:00:00.000Z")
      .add(60, "days")
      .unix(),
    minStake: parseEther("1"),
    maxStake: parseEther("10000"),
    capPercent: 40,
  },
  ganache: {
    issuer: env.GANACHE_FRACTAL_ISSUER,
    start: dayjs()
      .add(5, "minutes")
      .unix(),
    end: dayjs()
      .add(1, "days")
      .unix(),
    minStake: parseEther("1"),
    maxStake: parseEther("10000"),
    capPercent: 40,
  },
  mainnet: {
    fcl: env.MAINNET_FCL,
    lp: env.MAINNET_FCL_ETH_LP,
    issuer: process.env.MAINNET_FRACTAL_ISSUER,
    start: dayjs("TODO").unix(),
    end: dayjs("TODO")
      .add(60, "days")
      .unix(),
    minStake: parseEther("1"),
    maxStake: parseEther("1000"),
    capPercent: 40,
  },
};

async function deployTestTokens() {
  if (network.name === "mainnet") {
    throw "This script is not meant to be executed on mainnet";
  }

  const FCL = await ethers.getContractFactory("FractalToken");
  const LP = await ethers.getContractFactory("LPToken");

  const signers = await ethers.getSigners();
  const owner = signers[0];

  const fcl = await FCL.deploy(owner.address);
  const lp = await LP.deploy(owner.address);

  await fcl.deployed();
  await lp.deployed();

  console.log("Test FCL token deployed to:", fcl.address);
  console.log("Test FCL-ETH-LP token deployed to:", lp.address);

  return { fcl, lp };
}

async function deployRegistry(): Promise<any> {
  const ClaimsRegistry = await ethers.getContractFactory("ClaimsRegistry");

  console.log(`Deploying ClaimsRegistry`);
  const registry = await ClaimsRegistry.deploy();
  await registry.deployed();
  console.log("Registry deployed to:", registry.address);

  return registry;
}

async function deployStaking(registry: Contract, args: Record<string, string>) {
  const Staking = await ethers.getContractFactory("Staking");

  console.log(`Deploying FCL Staking`);
  const fclStaking = await Staking.deploy(
    args.fcl,
    registry.address,
    args.issuer,
    args.start,
    args.end,
    args.minStake,
    args.maxStake,
    args.capPercent
  );

  console.log(`Deploying FCL-ETH LP Staking`);
  const lpStaking = await Staking.deploy(
    args.lp,
    registry.address,
    args.issuer,
    args.start,
    args.end,
    args.minStake,
    args.maxStake,
    args.capPercent
  );

  console.log(`Both deployed. waiting for confirmation...`);
  await fclStaking.deployed();
  await lpStaking.deployed();
  console.log(`Done!`);

  return { fclStaking, lpStaking };
}

async function main() {
  const args = config[network.name];
  let tokens: any;

  if (network.name === "ganache") {
    tokens = await deployTestTokens();
    args.fcl = tokens.fcl.address;
    args.lp = tokens.lp.address;
  }

  const registry = await deployRegistry();
  const { fclStaking, lpStaking } = await deployStaking(registry, args);

  console.log(`
| Contract           | Address                                    |
| ------------------ | ------------------------------------------ |
| FCL Token          | ${args.fcl} |
| FCL-ETH LP Token   | ${args.lp} |
| ClaimRegistry      | ${registry.address} |
| FCL Staking        | ${fclStaking.address} |
| FTL-ETH LP Staking | ${lpStaking.address} |
`);
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
