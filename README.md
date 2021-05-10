# Fractal Staking/DID contracts

Contracts for Claims Registry and Token staking for the Fractal Wallet
& Protocol.

## Audit

All 3 contracts were audited by [Least Authority](https://leastauthority.com/).
The final audit report is publicly available
[here](./least-authority-audit.pdf).

## Development (with ganache)

### Secrets

A `.envrc` is available on keybase `fractalwallet` team. Request access to it,
and use it with [direnv](https://direnv.net/).

### Deploying to a local test node

1. Install [ganache](https://www.trufflesuite.com/ganache) on your system
2. Start `ganache` and create a workspace.
3. Ensure the mnemonic on `Settings > Accounts & Keys` matches the one on the
   `GANACHE_MNEMONIC` given on `.envrc`
4. `yarn run deploy:ganache`
5. Use the output addresses in whatever way you need

## Deployed addresses

### Ropsten (test v1)

| Contract           | Address                                    |
| ------------------ | ------------------------------------------ |
| FCL Token          | 0xf0Ec4dCD7D375023f2B8E9db19aC5DB95b06a06A |
| FCL-ETH LP Token   | 0x93c45B9a9151e8c4C88e9a4990853Fa2b500C07c |
| ClaimRegistry      | 0x181573a13F4BF5F76F6d09D0E2a7716F6929993A |
| FCL Staking        | 0x6b21231526C87EB88A8ECea9f351895AA85dcB84 |
| FTL-ETH LP Staking | 0x596644D95282Ce22fE92772DfbBaa60Ecd0018e9 |

### Ropsten (test v2)

| Contract           | Address                                    |
| ------------------ | ------------------------------------------ |
| FCL Token          | 0xf0Ec4dCD7D375023f2B8E9db19aC5DB95b06a06A |
| FCL-ETH LP Token   | 0x93c45B9a9151e8c4C88e9a4990853Fa2b500C07c |
| ClaimRegistry      | 0x3FDC8245C0D167Ff3d8369615975cA2D8b391732 |
| FCL Staking        | 0xb6F33aA4896239e63B1a0d58baA0bE748113b414 |
| FTL-ETH LP Staking | 0xCD6D1697c08dD717420BE2D987Eb80d85c962FFa |

### Mainnet

| Contract           | Address                                    |
| ------------------ | ------------------------------------------ |
| FCL Token          | 0xf4d861575ecc9493420a3f5a14f85b13f0b50eb3 |
| FCL-ETH LP Token   | 0xdec87f2f3e7a936b08ebd7b2371ab12cc8b68340 |
| ClaimRegistry      | 0x1A5FA65E50d503a29Ec57cD102f2e7970a6963BB |
| FCL Staking        | 0x3C9d5Ac3BC21436989bDf54067a2c58AA65e5111 |
| FTL-ETH LP Staking | 0x5Bff3B8631371461B791Cc2cF82d0E1a73d4B0c7 |

## Gas Cost Estimates

```
·------------------------------------------------|---------------------------|--------------|-----------------------------·
|              Solc version: 0.8.3               ·  Optimizer enabled: true  ·  Runs: 1000  ·  Block limit: 12450000 gas  │
·················································|···························|··············|······························
|  Methods                                       ·               62 gwei/gas                ·       2106.86 eur/eth       │
·······················|·························|·············|·············|··············|···············|··············
|  Contract            ·  Method                 ·  Min        ·  Max        ·  Avg         ·  # calls      ·  eur (avg)  │
·······················|·························|·············|·············|··············|···············|··············
|  ClaimsRegistry      ·  revokeClaim            ·          -  ·          -  ·       30876  ·            3  ·       4.03  │
·······················|·························|·············|·············|··············|···············|··············
|  ClaimsRegistry      ·  setClaimWithSignature  ·          -  ·          -  ·       53867  ·           10  ·       7.04  │
·······················|·························|·············|·············|··············|···············|··············
|  FakeClaimsRegistry  ·  setResult              ·          -  ·          -  ·       13237  ·            1  ·       1.73  │
·······················|·························|·············|·············|··············|···············|··············
|  FractalToken        ·  approve                ·          -  ·          -  ·       46286  ·           64  ·       6.05  │
·······················|·························|·············|·············|··············|···············|··············
|  FractalToken        ·  transfer               ·      51545  ·      51617  ·       51616  ·           65  ·       6.74  │
·······················|·························|·············|·············|··············|···············|··············
|  Staking             ·  stake                  ·     121239  ·     216839  ·      208906  ·           25  ·      27.29  │
·······················|·························|·············|·············|··············|···············|··············
|  Staking             ·  withdraw               ·      93648  ·     143548  ·      111208  ·           12  ·      14.53  │
·······················|·························|·············|·············|··············|···············|··············
|  Staking             ·  withdrawPool           ·      34317  ·      49317  ·       39317  ·            3  ·       5.14  │
·······················|·························|·············|·············|··············|···············|··············
|  Deployments                                   ·                                          ·  % of limit   ·             │
·················································|·············|·············|··············|···············|··············
|  CappedRewardCalculator                        ·          -  ·          -  ·      480612  ·        3.9 %  ·      62.78  │
·················································|·············|·············|··············|···············|··············
|  ClaimsRegistry                                ·          -  ·          -  ·      659374  ·        5.3 %  ·      86.13  │
·················································|·············|·············|··············|···············|··············
|  FakeClaimsRegistry                            ·          -  ·          -  ·      164773  ·        1.3 %  ·      21.52  │
·················································|·············|·············|··············|···············|··············
|  FractalToken                                  ·          -  ·          -  ·      691714  ·        5.6 %  ·      90.36  │
·················································|·············|·············|··············|···············|··············
|  Staking                                       ·    1745718  ·    1745778  ·     1745773  ·         14 %  ·     228.04  │
·················································|·············|·············|··············|···············|··············
|  TestCappedRewardCalculator                    ·          -  ·          -  ·      541164  ·        4.3 %  ·      70.69  │
·················································|·············|·············|··············|···············|··············
|  Verifier                                      ·          -  ·          -  ·      308583  ·        2.5 %  ·      40.31  │
·------------------------------------------------|-------------|-------------|--------------|---------------|-------------·
```

## Contracts

Two main contracts are included:
* Staking
* ClaimsRegistry

### ClaimsRegistry

In conjunction with the browser plugin, this contract can be used to submit and
verify claims.

Each claim has a few properties:
* `subject`: Who the claim is about
* `attester`: Who issued and signed the claim
* `claimHash`: A generic hash generatic by the browser. Allows verification of
    data without actually storing personal information
* `signature`: The signature, which must correspond to `hash([subject, claimHash])`

The expected flow is as follows:
* Plugin gathers all date and generates a root `claimHash`
* Plugin calls `registry.computeSignableKey(subjectAddress, rootHash)`, and
    receives a new hash, `signableHash` as a result
* Attester's wallet signs `signableHash` and returns the signature to the plugin
* Plugin calls `registry.setClaimWithSignature(subject, attester, rootHash,
    signature)`, which validates the signature against the subject, hash, and
    attester, and stores it
* Further calls to `registry.getClaim(attester, signature)` should return `subject`;


### Staking

A staking contract receives the following arguments:
* `_token`: Address of the ERC20 token to stake
* `_registry`: Address of the `ClaimsRegistry` contract
* `_attester`: Address of the attester to expect when verifying claims
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

## License

`fractal-contracts` is copyright &copy; 2021 Trust Fractal GmbH.

It is open-source, made available for free, and is subject to the terms in its [license].

## About

`fractal-contracts` was created and is maintained with :heart: by [Fractal Protocol][fractal].

[license]: ./LICENSE
[fractal]: https://protocol.fractal.id/

