import { ethers, network } from "hardhat";
import dayjs from "dayjs";

const { parseEther } = ethers.utils;
const { env, exit } = process;

const config: Record<string, any> = {
  ropsten: {
    fcl: env.ROPSTEN_FCL,
    lp: env.ROPSTEN_FCL_ETH_LP,
    issuer: env.ROPSTEN_FRACTAL_ISSUER,
    start: dayjs("23/04/2021", "DD/MM/YYYY").unix(),
    end: dayjs("24/04/2021", "DD/MM/YYYY")
      .add(5, "days")
      .unix(),
    minStake: parseEther("1"),
    maxStake: parseEther("10000"),
    capPercent: 40,
  },
  mainnet: {
    fcl: env.MAINNET_FCL,
    lp: env.MAINNET_FCL_ETH_LP,
    issuer: process.env.MAINNET_FRACTAL_ISSUER,
    start: dayjs("TODO", "DD/MM/YYYY").unix(),
    end: dayjs("TODO", "DD/MM/YYYY")
      .add(60, "days")
      .unix(),
    minStake: parseEther("1"),
    maxStake: parseEther("1000"),
    capPercent: 40,
  },
};

async function main() {
  const ClaimsRegistry = await ethers.getContractFactory("ClaimsRegistry");
  const Staking = await ethers.getContractFactory("Staking");

  const args = config[network.name];

  console.log(`Deploying ClaimsRegistry`);
  const registry = await ClaimsRegistry.deploy();
  await registry.deployed();
  console.log("Registry deployed to:", registry.address);

  console.log(`Deploying FCL Staking`);
  const fclStaking = await Staking.deploy(
    args.fcl,
    args.registry,
    args.issuer,
    args.start,
    args.end,
    args.minStake,
    args.maxStake,
    args.capPercent
  );

  console.log(`Deploying FCL-ETH LP Staking`);
  const uniStaking = await Staking.deploy(
    args.lp,
    args.registry,
    args.issuer,
    args.start,
    args.end,
    args.minStake,
    args.maxStake,
    args.capPercent
  );

  console.log(`Both deployed. waiting for confirmation...`);
  await fclStaking.deployed();
  await uniStaking.deployed();
  console.log(`Done!`);

  console.log("ClaimsRegistry deployed to:", registry.address);
  console.log("FCL Staking deployed to:", fclStaking.address);
  console.log("FCL/ETH LP Staking deployed to:", uniStaking.address);
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
