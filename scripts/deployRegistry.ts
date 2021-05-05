import { ethers } from "hardhat";

const { exit } = process;

async function deployRegistry(): Promise<any> {
  const ClaimsRegistry = await ethers.getContractFactory("ClaimsRegistry");

  console.log(`Deploying ClaimsRegistry`);
  const registry = await ClaimsRegistry.deploy();
  await registry.deployed();
  console.log("Registry deployed to:", registry.address);

  return registry;
}

async function main() {
  const registry = await deployRegistry();

  console.log(`
| Contract           | Address                                    |
| ------------------ | ------------------------------------------ |
| ClaimRegistry      | ${registry.address} |
`);
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
