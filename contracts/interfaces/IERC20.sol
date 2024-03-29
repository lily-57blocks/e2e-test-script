// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}