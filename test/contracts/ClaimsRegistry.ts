import chai from "chai";
import { ethers, network, waffle } from "hardhat";
import { solidity, MockProvider } from "ethereum-waffle";
import dayjs from "dayjs";

import { ClaimsRegistry } from "../../typechain/ClaimsRegistry";
import ClaimsRegistryArtifact from "../../artifacts/contracts/ClaimsRegistry.sol/ClaimsRegistry.json";

chai.use(solidity);
const { keccak256, toUtf8Bytes, arrayify } = ethers.utils;
const { expect } = chai;
const { deployContract } = waffle;

let registry: any;
const zero = "0x0000000000000000000000000000000000000000";

describe("ClaimsRegistry", () => {
  beforeEach(async () => {
    const owner = (await ethers.getSigners())[0];

    registry = (await deployContract(
      owner,
      ClaimsRegistryArtifact,
      []
    )) as ClaimsRegistry;
  });

  describe("setClaims", () => {
    const value = arrayify(keccak256(toUtf8Bytes("bar")));
    let attester: any;
    let subject: any;
    let johnDoe: any;
    let dataToSign: any;
    let sig: any;

    beforeEach(async () => {
      const signers = await ethers.getSigners();
      attester = signers[0];
      subject = signers[1];
      johnDoe = signers[2];
      dataToSign = arrayify(
        await registry.computeSignableKey(subject.address, value)
      );
      sig = await attester.signMessage(dataToSign);
    });

    describe("setClaimWithSignature", () => {
      it("attester can subject a claim about a subject", async () => {
        const action = registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        await expect(action).not.to.be.reverted;
      });

      it("any anonymous user can issue pre-signed claims", async () => {
        const action = registry
          .connect(johnDoe)
          .setClaimWithSignature(subject.address, attester.address, value, sig);

        await expect(action).not.to.be.reverted;
      });

      it("emits a ClaimIssued event", async () => {
        const action = registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        await expect(action)
          .to.emit(registry, "ClaimStored")
          .withArgs(sig);
      });
    });

    describe("getClaim", () => {
      it("returns the subject of a given attester's claim", async () => {
        await registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        const result = await registry.getClaim(attester.address, sig);

        expect(result).to.eq(subject.address);
      });
    });

    describe("verifyClaim", () => {
      it("is true if attester & claim match the subject", async () => {
        await registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        const result = await registry.verifyClaim(
          subject.address,
          attester.address,
          sig
        );

        expect(result).to.eq(true);
      });

      it("is false if claim does not exist", async () => {
        const result = await registry.verifyClaim(
          subject.address,
          attester.address,
          sig
        );

        expect(result).to.eq(false);
      });

      it("is false if subject is not the expected address", async () => {
        await registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        const result = await registry.verifyClaim(
          johnDoe.address,
          attester.address,
          sig
        );

        expect(result).to.eq(false);
      });
    });

    describe("revokeClaim", () => {
      it("allows attester to revoke an existing claim", async () => {
        await registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        expect(await registry.getClaim(attester.address, sig)).to.eq(
          subject.address
        );

        await registry.connect(attester).revokeClaim(sig);

        expect(await registry.getClaim(attester.address, sig)).to.eq(zero);
      });

      it("emits a ClaimRevoked event", async () => {
        await registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        const action = registry.revokeClaim(sig);

        await expect(action)
          .to.emit(registry, "ClaimRevoked")
          .withArgs(sig);
      });

      it("does not allow attester to revoke non-existing claims", async () => {
        const action = registry.connect(attester).revokeClaim(sig);

        await expect(action).to.be.revertedWith(
          "ClaimsRegistry: Claim not found"
        );
      });

      it("does not allow the subject to revoke an attester's claim", async () => {
        await registry.setClaimWithSignature(
          subject.address,
          attester.address,
          value,
          sig
        );

        const action = registry.connect(subject).revokeClaim(sig);

        await expect(action).to.be.revertedWith(
          "ClaimsRegistry: Claim not found"
        );
      });
    });
  });
});
