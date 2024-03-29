// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const bigInt = require("big-integer");

async function getTokenAmount(owner,toUser, tokenAddress, amount, decimals) {
  await hre.network.provider.request({method: "hardhat_impersonateAccount", params: [owner]});
  await hre.network.provider.request({method: "hardhat_setBalance", params: [owner, "0x56bc75e2d63100000"]});
  const signer = await hre.ethers.getSigner(owner);
  const token = await hre.ethers.getContractAt("IERC20", tokenAddress, signer);
  const balance = await token.balanceOf(owner);
  const expectedAmount = bigInt(amount).multiply(bigInt(10).pow(decimals));
  if(expectedAmount.greater(balance)) {
    console.log("Not enough balance");
    return;
  }
  const transferResult = await token.transfer(toUser, bigInt(amount).multiply(bigInt(10).pow(decimals)).toString());
  console.log("Transfer result:", transferResult);
}

const tokenConfig = {
  "1": {
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    owner: "0xFAC738Ee4F64d4b082D64CAC03bE9f78D72345AD",
  },
  "42161": {
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    owner: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  "137": {
    usdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    owner: "0x3A3BD7bb9528E159577F7C2e685CC81A765002E2",
  },
}
const receiver = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
const amount = "200000"
const decimals = 6


async function initSenderUSDC(chainId) {
  const { usdc, owner } = tokenConfig[chainId];
  await getTokenAmount(owner, receiver, usdc, amount, decimals);
}

exports.initSenderUSDC = initSenderUSDC;