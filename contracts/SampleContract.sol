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
  address constant public FRACTAL_SIGNER = 0xEdfFF6e8617586572e69566346bf7f1afbb3569d;

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
    return keccak256(abi.encodePacked(sender, kycType, countryOfResidence, countryOfIDIssuance, rootHash));
  }

  function verifyWithPrefix(bytes32 hash, bytes calldata sig, address signer) internal pure returns (bool) {
    return verify(addPrefix(hash), sig, signer);
  }

  function verify(bytes32 hash, bytes calldata sig, address signer) internal pure returns (bool) {
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
