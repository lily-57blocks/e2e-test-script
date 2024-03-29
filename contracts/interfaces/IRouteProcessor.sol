// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IRouteProcessor {
    function processRoute(
    address tokenIn,
    uint256 amountIn,
    address tokenOut,
    uint256 amountOutMin,
    address to,
    bytes memory route
  ) external payable returns (uint256 amountOut);
}