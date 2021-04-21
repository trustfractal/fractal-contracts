import { ethers, network } from "hardhat";

async function main() {
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
