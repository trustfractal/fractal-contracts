import { ethers, network } from "hardhat";
import dayjs from "dayjs";

const { parseEther } = ethers.utils;
const { env, exit } = process;

const config: Record<string, any> = {
  ropsten: {
    fcl: env.ROPSTEN_FCL,
    lp: env.ROPSTEN_FCL_ETH_LP,
    attester: env.ROPSTEN_FRACTAL_ATTESTER,
    registry: env.ROPSTEN_CLAIMS_REGISTRY_V2,
    start: dayjs("2021-05-07T13:00:00.000Z").unix(),
    end: dayjs("2021-05-07T13:00:00.000Z")
      .add(60, "days")
      .unix(),
    minStake: parseEther("1"),
    maxStake: parseEther("10000"),
    capPercent: 40,
  },
  ganache: {
    attester: env.GANACHE_FRACTAL_ATTESTER,
    registry: env.GANACHE_CLAIMS_REGISTRY,
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
    attester: process.env.MAINNET_FRACTAL_ATTESTER,
    registry: process.env.MAINNET_CLAIMS_REGISTRY,
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

async function deployStaking(args: Record<string, string>) {
  const Staking = await ethers.getContractFactory("Staking");

  console.log(`Deploying FCL Staking`);
  const fclStaking = await Staking.deploy(
    args.fcl,
    args.registry,
    args.attester,
    args.start,
    args.end,
    args.minStake,
    args.maxStake,
    args.capPercent
  );

  console.log(`Deploying FCL-ETH LP Staking`);
  const lpStaking = await Staking.deploy(
    args.lp,
    args.registry,
    args.attester,
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

  const { fclStaking, lpStaking } = await deployStaking(args);

  console.log(`
| Contract           | Address                                    |
| ------------------ | ------------------------------------------ |
| FCL Token          | ${args.fcl} |
| FCL-ETH LP Token   | ${args.lp} |
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
