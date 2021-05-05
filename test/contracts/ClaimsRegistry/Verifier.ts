import chai from "chai";
import { ethers, waffle } from "hardhat";
import { solidity } from "ethereum-waffle";

import { Verifier } from "../../../typechain/Verifier";
import VerifierArtifact from "../../../artifacts/contracts/ClaimsRegistry/Verifier.sol/Verifier.json";

chai.use(solidity);
const { keccak256, toUtf8Bytes, arrayify, splitSignature } = ethers.utils;
const { expect } = chai;
const { deployContract } = waffle;

let verifier: any;

describe("Verifier", () => {
  beforeEach(async () => {
    const owner = (await ethers.getSigners())[0];

    verifier = (await deployContract(owner, VerifierArtifact, [])) as Verifier;
  });

  describe("recoverWithPrefix", () => {
    it("returns the original signer of a message with an Ethereum prefix", async () => {
      const attester = (await ethers.getSigners())[0];
      const value = arrayify(keccak256(toUtf8Bytes("hello")));
      const sig = await attester.signMessage(value);

      const result = await verifier.recoverWithPrefix(value, sig);

      expect(result).to.eq(attester.address);
    });
  });

  describe("verifyWithPrefix", () => {
    it("returns the address of the signer", async () => {
      const attester = (await ethers.getSigners())[0];
      const value = arrayify(keccak256(toUtf8Bytes("hello")));
      const sig = await attester.signMessage(value);

      const result = await verifier.verifyWithPrefix(
        value,
        sig,
        attester.address
      );

      expect(result).to.equal(true);
    });
  });
});
