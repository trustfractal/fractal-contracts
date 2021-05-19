import { ethers } from "hardhat";

async function subscriptions(contract: any) {
  return contract.queryFilter(contract.filters.Subscribed(null), 12406638);
}

async function main() {
  const Staking = await ethers.getContractFactory("Staking");

  const fcl = Staking.attach("0x3C9d5Ac3BC21436989bDf54067a2c58AA65e5111");
  const lp = Staking.attach("0x5Bff3B8631371461B791Cc2cF82d0E1a73d4B0c7");

  const fclSubs = await subscriptions(fcl);
  const lpSubs = await subscriptions(lp);

  console.log(`FCL staking events: ${fclSubs.length}`);
  console.log(`FCL-ETH LP staking events: ${lpSubs.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
