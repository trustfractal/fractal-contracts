import chai from "chai";
import { ethers, network, waffle } from "hardhat";
import { solidity, MockProvider } from "ethereum-waffle";
import dayjs from "dayjs";

import { SampleContract } from "../../typechain/SampleContract";
import SampleContractArtifact from "../../artifacts/contracts/SampleContract.sol/SampleContract.json";

chai.use(solidity);
const { keccak256, toUtf8Bytes, arrayify } = ethers.utils;
const { expect } = chai;
const { deployContract } = waffle;

let sample: any;

describe("SampleContracts", () => {
  beforeEach(async () => {
    const owner = (await ethers.getSigners())[0];

    sample = (await deployContract(
      owner,
      SampleContractArtifact,
      []
    )) as SampleContract;
  });

  describe("verify", () => {
    it("works", async () => {
      const address = "0x6445a071d2Ca91Be37e4f965Bc0DfB5De9b5ce13";
      const rootHash = arrayify(
        "0x7af8dc2e3e312b59bc23f248ac619c5766b821776f8f51526fe583577fc314e8"
      );
      const dataToSign = await sample.computeKey(address, 1, 1, 1, rootHash);
      const sig = arrayify(
        "0x2dc8d36a764468b5c3341b2975198d1d027a355f14e5a58d5d811e37ddf18ccd6b5986b66c18857f8423f4558275882f8aeeb90e893d1f4aa59b21d4833ce2a51b"
      );

      // 0xd5efcc4aa10a0ef2e915d6c5d0bd96b8d636ba9e125c70324ad3e4ca4a42def2
      console.log("dataToSign: ", dataToSign);

      const result = await sample.verify(address, 1, 1, 1, rootHash, sig);
    });
  });
});
