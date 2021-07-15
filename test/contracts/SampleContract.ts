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

const credential = {
  claim: {
    owner: "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
    properties: {
      liveness: true,
      full_name: "Mr. Bean",
      date_of_birth: "1982-05-09",
      place_of_birth: null,
      wallet_address: "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
      wallet_currency: "ETH",
      residential_address: "Street name\nHouse number\nCity\nPostal code",
      residential_address_country: "PT",
      identification_document_type: "passport",
      identification_document_number: "CA00000AA",
      identification_document_country: "IT",
    },
    claimTypeHash:
      "0x07b3e9c50ac03ca6e79db2535b4c795dbb98f43c2a43b4ac59570c605ba1117c",
  },
  kycType: 1,
  rootHash:
    "0x92d68012754b9b68851f28797a6b20cac497a8deb477af35aaa6aab7d18dea2e",
  claimHashTree: {
    liveness: {
      hash:
        "0x63601795f5fae060e83e0b502cea3a2fc0fe2f8eecd290bb70284b6fc098166b",
      nonce: "574cccf3-9ac4-4ab7-8bc8-d92d66f2bb6b",
    },
    full_name: {
      hash:
        "0xa25d0f1659549747b8b2c56918c53085ab6ba5f51bb869ddc0d7291d73d4bc85",
      nonce: "704526d3-d84e-4275-a7ff-e971b1cc5398",
    },
    date_of_birth: {
      hash:
        "0x57afe0e3be5d750534bf932d2b002d915c4ceb8067772dc4ed15f0608a2983fa",
      nonce: "966abf6f-0291-4f5d-89e4-1d9a582292b5",
    },
    place_of_birth: {
      hash:
        "0xe4955b2a56cd4239582afc3495aee1433183805bb58f4e34105c789a005a46d2",
      nonce: "31d9f720-c612-401a-9ebc-dc680d1033ea",
    },
    wallet_address: {
      hash:
        "0x47b33648dec98f4ccf11edc22fe221147a7ecd04faa45ccfd4d07cb5d7c72a09",
      nonce: "0ecdfd1c-a40c-49e0-8f41-b102896d6f07",
    },
    wallet_currency: {
      hash:
        "0x9de1a0cbb5205c461ce43551c10ed7a3d901fa57c866c7d8c30323a7889c1877",
      nonce: "0153ef93-d81b-492d-8a3f-d9b417275e40",
    },
    residential_address: {
      hash:
        "0x43147f9715bc2cb83c363908caf651b4dff883ac7cbfca9139f1916992ef9cc3",
      nonce: "02a4df88-90e9-47f1-8547-f16b825b493c",
    },
    residential_address_country: {
      hash:
        "0xde77f8e8c913b7a51fae028364fa669822cff5de8d1e4009f7aa81a22f8e1865",
      nonce: "c98329ab-a438-42a7-a7a0-4d736c8d9313",
    },
    identification_document_type: {
      hash:
        "0xed62ebdd11ee2b4ed03d7d16353fb3cd4ed001d8a82e2d915e177ed7bf5edf2e",
      nonce: "f9845f46-8d28-496c-8735-72b3d3bd86ac",
    },
    identification_document_number: {
      hash:
        "0x1c978cff9830e4781c523ffdbfb32122a953120ae04f4eac0daf31f6c75079c4",
      nonce: "ff4a7df8-11a7-40da-a535-a7b2f884e42f",
    },
    identification_document_country: {
      hash:
        "0x24eee8b902cd585d924ed001d98ce010ea12420e149d0fc022000dde66d7dd11",
      nonce: "f366dfae-1b86-482f-a6f3-e9304dd92868",
    },
  },
  claimtypehash: {
    hash: "0xd26948d0f0ca9d317432812e80a469cab50e4f5d0a982c6b0746ac187a49906c",
    nonce: "e382c255-2aee-4e54-a412-10162dcb4b61",
  },
  claimeraddress: "0xe3749e993f0a63dd4bb163ed70e1c9965a2d2b7f",
  attesteraddress: "0x7972fd0456e94f2140e7ac274e2499039fdf8741",
  attestersignature:
    "0x06d7fa1fa39f2e11fbb548c599073580d1cd0faf4793379e24005aec3c228bed1d52682960ec1a911ee2d269b1c60851536e5fe0735291926009edaf7e7c6ce31c",
  countryofresidence: 1,
  countryofidissuance: 1,
};

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
      const rootHash = arrayify(credential["rootHash"]);
      // const dataToSign = await sample.computeKey(address, 1, 1, 1, rootHash);
      // const sig = arrayify(
      //   "0x2dc8d36a764468b5c3341b2975198d1d027a355f14e5a58d5d811e37ddf18ccd6b5986b66c18857f8423f4558275882f8aeeb90e893d1f4aa59b21d4833ce2a51b"
      // );

      // // 0xd5efcc4aa10a0ef2e915d6c5d0bd96b8d636ba9e125c70324ad3e4ca4a42def2
      // console.log("dataToSign: ", dataToSign);

      const result = await sample.verify(
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        credential["kycType"],
        credential["countryofresidence"],
        credential["countryofidissuance"],
        arrayify(
          "0x71a208ffafacafa1f4f073137482896773c0b2c495bc4ec7e798cba5b1fd7600"
        ),
        arrayify(
          "0xcd651681cefb398579cd1b538ccb31bb572ef89c0dd733e6d040d5a2541a505639127833e0fc9ecdaa3c2249299eb2892fcacbaf447fdcba99f139d12cfdb1a01b"
        )
      );

      await sample.transferAndVerify(
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        1,
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        credential["kycType"],
        credential["countryofresidence"],
        credential["countryofidissuance"],
        arrayify(
          "0x71a208ffafacafa1f4f073137482896773c0b2c495bc4ec7e798cba5b1fd7600"
        ),
        arrayify(
          "0xcd651681cefb398579cd1b538ccb31bb572ef89c0dd733e6d040d5a2541a505639127833e0fc9ecdaa3c2249299eb2892fcacbaf447fdcba99f139d12cfdb1a01b"
        )
      );

      await sample.transferAndVerify(
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        1,
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        credential["kycType"],
        credential["countryofresidence"],
        credential["countryofidissuance"],
        arrayify(
          "0x71a208ffafacafa1f4f073137482896773c0b2c495bc4ec7e798cba5b1fd7600"
        ),
        arrayify(
          "0xcd651681cefb398579cd1b538ccb31bb572ef89c0dd733e6d040d5a2541a505639127833e0fc9ecdaa3c2249299eb2892fcacbaf447fdcba99f139d12cfdb1a01b"
        )
      );

      await sample.transfer(
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        "0xE3749E993F0A63DD4BB163ed70e1c9965A2D2b7f",
        1
      );
      console.log(result);
    });
  });
});
