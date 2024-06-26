// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main(routerAddr) {
  console.log(routerAddr);
  const callHelper = await hre.ethers.deployContract("CallHelper", [routerAddr]);
  await callHelper.waitForDeployment();
  const callHelperAddr = callHelper.target;
  console.log("CallHelper deployed to:", callHelperAddr);
  return callHelperAddr;
}

exports.deployCallHelper = main;