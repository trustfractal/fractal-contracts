import chai from "chai";
import { ethers, network, waffle } from "hardhat";
import { solidity } from "ethereum-waffle";
import dayjs from "dayjs";

import { CappedRewardCalculator } from "../../../typechain/CappedRewardCalculator";
import CappedRewardCalculatorArtifact from "../../../artifacts/contracts/Staking/CappedRewardCalculator.sol/CappedRewardCalculator.json";
import { TestCappedRewardCalculator } from "../../../typechain/TestCappedRewardCalculator";
import TestCappedRewardCalculatorArtifact from "../../../artifacts/contracts/Test/CappedRewardCalculator.sol/TestCappedRewardCalculator.json";

chai.use(solidity);

const { BigNumber: BN } = ethers;
const { parseEther, formatUnits } = ethers.utils;
const { expect } = chai;
const { deployContract: deploy } = waffle;

describe("CappedRewardCalculator", () => {
  let owner: any;
  let calc: any;
  let tester: any;

  let deployDate = dayjs().unix();
  let start = dayjs
    .unix(deployDate)
    .add(1, "day")
    .unix();
  let twoMonthsLater = dayjs
    .unix(start)
    .add(60, "day")
    .unix();

  const ensureTimestamp = (timestamp: number): Promise<unknown> => {
    return network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  };

  before(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
  });

  beforeEach(async () => {
    const lastBlock = await ethers.provider.getBlockNumber();
    const timestamp = (await ethers.provider.getBlock(lastBlock)).timestamp;

    deployDate = timestamp + 1;

    start = dayjs
      .unix(deployDate)
      .add(1, "day")
      .unix();
    twoMonthsLater = dayjs
      .unix(start)
      .add(60, "day")
      .unix();

    ensureTimestamp(deployDate);
  });

  describe("constructor", () => {
    it("creates a contract when given valid arguments", async () => {
      const calc = (await deploy(owner, CappedRewardCalculatorArtifact, [
        start,
        twoMonthsLater,
        100,
      ])) as CappedRewardCalculator;

      expect(await calc.startDate()).to.eq(start);
      expect(await calc.endDate()).to.eq(twoMonthsLater);
      expect(await calc.cap()).to.eq(100);
    });

    it("fails if startDate is in the past", async () => {
      const yesterday = dayjs()
        .subtract(1, "day")
        .unix();
      const args = [yesterday, twoMonthsLater, 100];

      const action = deploy(owner, CappedRewardCalculatorArtifact, args);

      await expect(action).to.be.revertedWith(
        "CappedRewardCalculator: start date must be in the future"
      );
    });

    it("fails if endDate is before startDate", async () => {
      const args = [twoMonthsLater, start, 100];

      const action = deploy(owner, CappedRewardCalculatorArtifact, args);

      await expect(action).to.be.revertedWith(
        "CappedRewardCalculator: end date must be after start date"
      );
    });

    it("fails if curveCap is zero", async () => {
      const args = [start, twoMonthsLater, 0];

      const action = deploy(owner, CappedRewardCalculatorArtifact, args);

      await expect(action).to.be.revertedWith(
        "CappedRewardCalculator: curve cap cannot be 0"
      );
    });
  });

  describe("private functions", () => {
    beforeEach(async () => {
      const args = [start, twoMonthsLater, 100];

      tester = (await deploy(
        owner,
        TestCappedRewardCalculatorArtifact,
        args
      )) as TestCappedRewardCalculator;
    });

    describe("truncatePeriod", () => {
      it("truncates given startDate", async () => {
        const [r1, r2] = await tester.testTruncatePeriod(start - 1, start + 1);

        expect(r1).to.eq(start);
        expect(r2).to.eq(start + 1);
      });

      it("truncates given endDate", async () => {
        const [r1, r2] = await tester.testTruncatePeriod(
          start + 1,
          twoMonthsLater + 1
        );

        expect(r1).to.eq(start + 1);
        expect(r2).to.eq(twoMonthsLater);
      });

      it("gives a 0-length period if outside of bounds", async () => {
        const [r1, r2] = await tester.testTruncatePeriod(
          twoMonthsLater,
          twoMonthsLater + 10
        );

        expect(r1).to.eq(r2);
      });
    });

    describe("toPeriodPercents", () => {
      it("calculates 0% to 100%", async () => {
        const [r1, r2] = await tester.testToPeriodPercents(
          start,
          twoMonthsLater
        );

        expect(r1).to.eq(0);
        expect(r2).to.eq(1000000);
      });

      it("calculates 0% to 50%", async () => {
        const [r1, r2] = await tester.testToPeriodPercents(
          start,
          (start + twoMonthsLater) / 2
        );

        expect(r1).to.eq(0);
        expect(r2).to.eq(500000);
      });

      it("calculates 50% to 100%", async () => {
        const [r1, r2] = await tester.testToPeriodPercents(
          (start + twoMonthsLater) / 2,
          twoMonthsLater
        );

        expect(r1).to.eq(500000);
        expect(r2).to.eq(1000000);
      });

      it("calculates 10% to 90%", async () => {
        const [r1, r2] = await tester.testToPeriodPercents(
          start + (twoMonthsLater - start) * 0.1,
          start + (twoMonthsLater - start) * 0.9
        );

        expect(r1).to.eq(100000);
        expect(r2).to.eq(900000);
      });
    });

    describe("curvePeriodPercentage", () => {
      it("is maximum from 0% to 100%", async () => {
        const apr1 = await tester.testCurvePercentage(0, 1000000);
        const apr2 = await tester.testCurvePercentage(0, 900000);

        expect(apr1).to.be.gt(apr2);
      });

      it("is greater if you enter earlier but stay the same time", async () => {
        const apr1 = await tester.testCurvePercentage(0, 300000);
        const apr2 = await tester.testCurvePercentage(100000, 400000);

        expect(apr1).to.be.gt(apr2);
      });

      it("each 10% segment is smaller than or equal the last", async () => {
        let last = 10e10;

        for (let i = 0; i < 1000000; i += 1000000) {
          const apr = await tester.testCurvePercentage(i, i + 100000);

          expect(apr).to.be.lte(last);
          last = apr;
        }
      });

      it("staying for 10% more increases your total APR", async () => {
        let last = 0;

        for (let i = 0; i < 1000000; i += 100000) {
          const apr = await tester.testCurvePercentage(0, i + 10);

          expect(apr).to.be.gte(last);
          last = apr;
        }
      });

      it("at least on the first 80%, each 10% segment is smaller than the last", async () => {
        let last = 10e10;

        for (let i = 0; i < 800000; i += 100000) {
          const apr = await tester.testCurvePercentage(i, i + 100000);

          expect(apr).to.be.lt(last);
          last = apr;
        }
      });
    });
  });

  describe("public functions", () => {
    beforeEach(async () => {
      const args = [start, twoMonthsLater, 40];

      calc = (await deploy(
        owner,
        CappedRewardCalculatorArtifact,
        args
      )) as CappedRewardCalculator;
    });

    describe("calculate reward", () => {
      describe("for curve period", () => {
        it("works for 100 units throught the entire curve period", async () => {
          const reward = await calc.calculateReward(start, twoMonthsLater, 100);

          expect(reward).to.eq(40);
        });

        it("is proportional to how many tokens I stake", async () => {
          const reward100 = await calc.calculateReward(
            start,
            twoMonthsLater,
            100
          );
          const reward1000 = await calc.calculateReward(
            start,
            twoMonthsLater,
            1000
          );

          expect(reward1000).to.be.closeTo(reward100.mul(10), 10);
        });

        it("is zero if range is outside period", async () => {
          const reward = await calc.calculateReward(start - 1, start, 100);

          expect(reward).to.eq(0);
        });

        it("cumulative value increases over time", async () => {
          let last = 0;

          for (let i = 0.1; i <= 0.8; i += 0.1) {
            const reward = await calc.calculateReward(
              start,
              start + (twoMonthsLater - start) * i,
              1000
            );

            expect(reward).to.be.gt(last);
            last = reward;
          }
        });

        it("individual value is lower for every period", async () => {
          let last = 10e10;

          for (let i = 0.1; i <= 0.8; i += 0.1) {
            const reward = await calc.calculateReward(
              start + (twoMonthsLater - start) * (i - 0.1),
              start + (twoMonthsLater - start) * i,
              1000
            );

            expect(reward).to.be.lt(last);
            last = reward;
          }
        });
      });
    });

    describe("currentAPY", () => {
      it("is around 700% before the beginning", async () => {
        const halfDayLater = dayjs
          .unix(start)
          .add(-12, "hours")
          .unix();

        ensureTimestamp(halfDayLater);
        network.provider.send("evm_mine", []);

        const apy = await calc.currentAPY();

        expect(apy).to.eq(717);
      });

      it("is 0% after the end", async () => {
        const halfDayAfterClose = dayjs
          .unix(twoMonthsLater)
          .add(12, "hours")
          .unix();

        ensureTimestamp(halfDayAfterClose);
        network.provider.send("evm_mine", []);

        const apy = await calc.currentAPY();

        expect(apy).to.eq(0);
      });

      it("matches the pre-calculated expected values", async () => {
        const apyAfter = async (days: number, type: any) => {
          ensureTimestamp(
            dayjs
              .unix(start)
              .add(days, type)
              .unix()
          );
          network.provider.send("evm_mine", []);
          return calc.currentAPY();
        };

        const apy0 = await apyAfter(0, "days");
        const apy1h = await apyAfter(1, "hour");
        const apy12h = await apyAfter(12, "hour");
        const apy1d = await apyAfter(1, "days");
        const apy10d = await apyAfter(10, "days");
        const apy50d = await apyAfter(50, "days");
        const apy51d = await apyAfter(51, "days");
        const apy55d = await apyAfter(55, "days");
        const apy60d = await apyAfter(60, "days");

        expect(apy0).to.eq(717);
        expect(apy1h).to.eq(716);
        expect(apy12h).to.eq(705);
        expect(apy1d).to.eq(693);
        expect(apy10d).to.eq(496);
        expect(apy50d).to.eq(18);
        expect(apy51d).to.eq(14);
        expect(apy55d).to.eq(4);
        expect(apy60d).to.eq(0);
      });
    });
  });
});
