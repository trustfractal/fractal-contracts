// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import { Verifier } from "./ClaimsRegistry/Verifier.sol";
import "hardhat/console.sol";

contract SampleContract {

  // kycType - 1 byte
// countryOfResidence - 1 byte
// countryOfIDIssuance - 1 byte
// rootHash - 32 bytes
// credentialSignature - 65 bytes
  address constant public FRACTAL_SIGNER = 0x7972fd0456E94F2140e7AC274E2499039Fdf8741;

  mapping(address => uint256) amounts;
  mapping(address => KYC) kycs;

  struct KYC {
    uint8 kycType;
    uint8 countryOfResidence;
    uint8 countryOfIDIssuance;
    bytes32 rootHash;
    bytes sig;
  }

  function transferAndVerify(address _to, uint256 amount,
    address sender,
    uint8 kycType,
    uint8 countryOfResidence,
    uint8 countryOfIDIssuance,
    bytes32 rootHash,
    bytes calldata sig
  ) external {
    // erc20.transferFrom(...)
    bytes32 signable = computeKey(sender, kycType, countryOfResidence, countryOfIDIssuance, rootHash);

    KYC storage kyc = kycs[sender];

    if (kyc.kycType == 0) {
      require(verifyWithPrefix(signable, sig, FRACTAL_SIGNER), "invalid sig");
      kyc.kycType = kycType;
      kyc.countryOfResidence= countryOfResidence;
      kyc.countryOfIDIssuance=countryOfIDIssuance;
      // kyc.rootHash=rootHash;
      // kyc.sig=sig;
    }

    amounts[sender] += amount;
  }

  function transfer(address sender, address _to, uint256 amount) external {
    // erc20.transferFrom(...)
    KYC storage kyc = kycs[sender];

    if (kyc.kycType == 0) {
      require(false, "not verified");
    }

    amounts[sender] += amount;
  }

  function verify(
    address sender,
    uint8 kycType,
    uint8 countryOfResidence,
    uint8 countryOfIDIssuance,
    bytes32 rootHash,
    bytes calldata sig
  ) external pure returns (bool) {
    bytes32 signable = computeKey(sender, kycType, countryOfResidence, countryOfIDIssuance, rootHash);

    require(verifyWithPrefix(signable, sig, FRACTAL_SIGNER));
  }

  function computeKey(
    address sender,
    uint8 kycType,
    uint8 countryOfResidence,
    uint8 countryOfIDIssuance,
    bytes32 rootHash
  ) public pure returns (bytes32) {
    // return keccak256(abi.encodePacked(sender));
    return keccak256(abi.encodePacked(sender, kycType, countryOfResidence, countryOfIDIssuance, rootHash));
  }

  function verifyWithPrefix(bytes32 hash, bytes calldata sig, address signer) internal pure returns (bool) {
    return _verify(addPrefix(hash), sig, signer);
  }

  function _verify(bytes32 hash, bytes calldata sig, address signer) internal pure returns (bool) {
    return recover(hash, sig) == signer;
  }

  function recover(bytes32 hash, bytes calldata _sig) internal pure returns (address) {
    bytes memory sig = _sig;
    bytes32 r;
    bytes32 s;
    uint8 v;

    if (sig.length != 65) {
      return address(0);
    }

    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := and(mload(add(sig, 65)), 255)
    }

    if (v < 27) {
      v += 27;
    }

    if (v != 27 && v != 28) {
      return address(0);
    }

    return ecrecover(hash, v, r, s);
  }

  function addPrefix(bytes32 hash) private pure returns (bytes32) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";

    return keccak256(abi.encodePacked(prefix, hash));
  }
}
