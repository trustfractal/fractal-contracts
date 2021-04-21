# Fractal Staking/DID contracts

## Deployed addresses

### Ropsten

| Contract           | Address                                    | Etherscan                                                                             |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| FCL Token          | 0xf0Ec4dCD7D375023f2B8E9db19aC5DB95b06a06A | [link](https://ropsten.etherscan.io/token/0xf0ec4dcd7d375023f2b8e9db19ac5db95b06a06a) |
| FCL-ETH LP Token   | 0x93c45B9a9151e8c4C88e9a4990853Fa2b500C07c | [link](https://ropsten.etherscan.io/token/0x93c45b9a9151e8c4c88e9a4990853fa2b500c07c) |
| ClaimRegistry      | TODO                                       | TODO |
| FCL Staking        | TODO                                       | TODO |
| FTL-ETH LP Staking | TODO                                       | TODO |

### Mainnet

| Contract           | Address                                    | Etherscan                                                                       |
| ------------------ | ------------------------------------------ | --------------------------------------------------------------------------------|
| FCL Token          | 0xf4d861575ecc9493420a3f5a14f85b13f0b50eb3 | [link](https://ropsten.etherscan.io/token/0xf0ec4dcd7d375023f2b8e9db19ac5db95b06a06a) |
| FCL-ETH LP Token   | 0xdec87f2f3e7a936b08ebd7b2371ab12cc8b68340 | [link](https://ropsten.etherscan.io/token/0x93c45b9a9151e8c4c88e9a4990853fa2b500c07c) |
| ClaimRegistry      | TODO                                       | TODO |
| FCL Staking        | TODO                                       | TODO |
| FTL-ETH LP Staking | TODO                                       | TODO |

## Secrets

A `.envrc` is available on keybase `fractalwallet` team. Request access to it,
and use it with [direnv](https://direnv.net/).

## Contracts

Two main contracts are included:
* Staking
* ClaimsRegistry

### ClaimsRegistry

In conjunction with the browser plugin, this contract can be used to submit and
verify claims.

Each claim has a few properties:
* `subject`: Who the claim is about
* `issuer`: Who issued and signed the claim
* `claimHash`: A generic hash generatic by the browser. Allows verification of
    data without actually storing personal information
* `signature`: The signature, which must correspond to `hash([subject, claimHash])`

The expected flow is as follows:
* Plugin gathers all date and generates a root `claimHash`
* Plugin calls `registry.computeSignableKey(subjectAddress, rootHash)`, and
    receives a new hash, `signableHash` as a result
* Issuer's wallet signs `signableHash` and returns the signature to the plugin
* Plugin calls `registry.setClaimWithSignature(subject, issuer, rootHash,
    signature)`, which validates the signature against the subject, hash, and
    issuer, and stores it
* Further calls to `registry.getClaim(issuer, signature)` should return `subject`;


### Staking

A staking contract receives the following arguments:
* `_token`: Address of the ERC20 token to stake
* `_registry`: Address of the `ClaimsRegistry` contract
* `_issuer`: Address of the issuer to expect when verifying claims
* `_startDate`: Timestamp at which staking becomes possible
* `_endDate`: Timestamp at which staking is over
* `_individualMinimumAmount`: Minimum amount (in token subunits) required for each subscription
* `_cap`: Percentage (multiplied by 100) of the maximum reward each subscription can yield. A stake of 100 tokens with a 40 cap means the maximum reward is 40 tokens.

The expected flow is as follows:
* Once deployed, the desired pool of tokens must be transfered to the contract's
    address
* Once `startDate` is reached, staking becomes possible
* Rewards are calculated at the moment staking happens, but will be
    re-calculated if users withdraw earlier than `endDate`
* Rewards are calculated according to what was discussed on [this spreadsheet](https://docs.google.com/spreadsheets/d/1SgW1LuTldfKEVkbrpkI_7pcIUDeacjRYHsuJTkXOGJE/edit#gid=2055588626) (ask Miguel Palhas (miguel@subvisual.co) for access if needed)
* When a stake is created, the calculated maximum reward is locked
* If the calculated reward is larger than the remaining pool (not counting
    already locked tokens), stake is refused
* Plugin can query the contract to get the current pool availability, size of
    a particular stake, current reward, start/end dates, and calculate a reward
    for arbitrary numbers before issuing a stake
