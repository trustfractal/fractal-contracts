// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

// curve definition:
// https://www.desmos.com/calculator/8xyyuznuz3
//
// integral:
// https://www.wolframalpha.com/input/?i=integrate%5B-1%2B1.01*10%5E%282-0.02*x%29%2C+x%5D

/// @title Calculates rewards based on an initial downward curve period, and a second constant period
/// @author Miguel Palhas <miguel@subvisual.co>
contract CappedRewardCalculator {
  /// @notice start of the staking period
  uint public startDate;
  /// @notice end of the staking period
  uint public endDate;
  /// @notice Reward cap for curve period
  uint public cap;

  uint constant private year = 365 days;
  uint constant private day = 1 days;
  uint private constant mul = 1000000;

  /// @notice constructor
  /// @param _start The start timestamp for staking
  /// @param _start The end timestamp for staking
  /// @param _cap The cap percentage of the reward (40 == maximum of 40% of your initial stake)
  constructor(
    uint _start,
    uint _end,
    uint _cap
  ) {
    require(block.timestamp <= _start, "CappedRewardCalculator: start date must be in the future");
    require(
      _start < _end,
      "CappedRewardCalculator: end date must be after start date"
    );

    require(_cap > 0, "CappedRewardCalculator: curve cap cannot be 0");

    startDate = _start;
    endDate = _end;
    cap = _cap;
  }

  /// @notice Given a timestamp range and an amount, calculates the expected nominal return
  /// @param _start The start timestamp to consider
  /// @param _end The end timestamp to consider
  /// @param _amount The amount to stake
  /// @return The nominal amount of the reward
  function calculateReward(
    uint _start,
    uint _end,
    uint _amount
  ) public view returns (uint) {
    (uint start, uint end) = truncatePeriod(_start, _end);
    (uint startPercent, uint endPercent) = toPeriodPercents(start, end);

    uint percentage = curvePercentage(startPercent, endPercent);

    uint reward = _amount * cap * percentage / (mul * 100);

    return reward;
  }

  /// @notice Estimates the current offered APY
  /// @return The estimated APY (40 == 40%)
  function currentAPY() public view returns (uint) {
    uint amount = 100 ether;
    uint current = block.timestamp + day;
    uint currentReward = calculateReward(startDate, current, amount);

    uint previous = current - day;
    uint previousReward = 0;
    if (previous > startDate) {
      previousReward = calculateReward(startDate, previous, amount);
    }

    uint delta = currentReward - previousReward;
    uint apy = delta * 365 * 100 / amount;

    return apy;
  }

  function toPeriodPercents(
    uint _start,
    uint _end
  ) internal view returns (uint, uint) {
    uint totalDuration = endDate - startDate;

    if (totalDuration == 0) {
      return (0, mul);
    }

    uint startPercent = (_start - startDate) * mul / totalDuration;
    uint endPercent = (_end - startDate) * mul / totalDuration;

    return (startPercent, endPercent);
  }

  function truncatePeriod(
    uint _start,
    uint _end
  ) internal view returns (uint, uint) {
    if (_end <= startDate || _start >= endDate) {
      return (startDate, startDate);
    }

    uint start = _start < startDate ? startDate : _start;
    uint end = _end > endDate ? endDate : _end;

    return (start, end);
  }

  function curvePercentage(uint _start, uint _end) internal pure returns (uint) {
    int maxArea = integralAtPoint(mul) - integralAtPoint(0);
    int actualArea = integralAtPoint(_end) - integralAtPoint(_start);

    uint ratio = uint(actualArea * int(mul) / maxArea);

    return ratio;
  }


  function integralAtPoint(uint _x) internal pure returns (int) {
    int x = int(_x);
    int p1 = ((x - int(mul)) ** 3) / (3 * int(mul));

    return p1;
  }
}
