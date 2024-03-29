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

async function swapERC20Token(callHelperAddr, sender, toUser, inToken, toToken, amount, callData){
    const signer = await hre.ethers.getSigner(sender);
    const toTokenContract = await hre.ethers.getContractAt("IERC20", toToken);
    const inTokenContract = await hre.ethers.getContractAt("IERC20", inToken, signer);
    let preOutBalance = 0;
    if(toToken.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        preOutBalance = await hre.ethers.provider.getBalance(toUser);
    } else {
        preOutBalance = await toTokenContract.balanceOf(toUser);
    }
    const preInBalance = await inTokenContract.balanceOf(sender);
    const callHelper = await hre.ethers.getContractAt("CallHelper", callHelperAddr, signer);
    await inTokenContract.approve(callHelperAddr, amount);
    const transferTX = await callHelper.testCallERC20(inToken, amount, callData);
    const transferResult = await transferTX.wait();
    const postInBalance = await inTokenContract.balanceOf(sender);
    let postOutBalance = 0;
    if(toToken.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        postOutBalance = await hre.ethers.provider.getBalance(toUser);
    } else {
        postOutBalance = await toTokenContract.balanceOf(toUser);
    }
    // console.log(`inToken ${inToken} : \n pre balance: ${preInBalance}, post balance: ${postInBalance}`);
    // console.log(`toToken ${toToken} : \n pre balance: ${preOutBalance}, post balance: ${postOutBalance}`);
    // console.log(`token changes:\n inToken ${inToken} => ${bigInt(preInBalance).minus(bigInt(postInBalance))}\n ${toToken} => ${bigInt(postOutBalance).minus(bigInt(preOutBalance))}`);
    // console.log(`Swap token ${inToken} to ${toToken} result:\n`, transferResult);
    const swapOutResult = bigInt(postOutBalance).minus(bigInt(preOutBalance))
    return swapOutResult;
}

async function swapNativeToken(callHelperAddr, sender, toUser, toToken, amount, callData){
    const signer = await hre.ethers.getSigner(sender);
    const preNativeBalance = await hre.ethers.provider.getBalance(sender);
    const toTokenContract = await hre.ethers.getContractAt("IERC20", toToken);
    const preOutBalance = await toTokenContract.balanceOf(toUser);
    const callHelper = await hre.ethers.getContractAt("CallHelper", callHelperAddr, signer);
    const transferTX = await callHelper.testCallNative(callData, {value: amount});
    const transferResult = await transferTX.wait();
    const postNativeBalance = await hre.ethers.provider.getBalance(sender);
    const postOutBalance = await toTokenContract.balanceOf(toUser);
    // console.log(`Native token : \n pre balance: ${preNativeBalance}, post balance: ${postNativeBalance}`);
    // console.log(`toToken ${toToken} : \n pre balance: ${preOutBalance}, post balance: ${postOutBalance}`);
    // console.log(`token changes: native token => ${bigInt(preNativeBalance).minus(bigInt(postNativeBalance))} \n ${toToken} => ${bigInt(postOutBalance).minus(bigInt(preOutBalance))}`);
    // console.log(`Swap native token to ${toToken} result:\n`, transferResult);
    const swapOutResult = bigInt(postOutBalance).minus(bigInt(preOutBalance))
    return swapOutResult;
}

exports.getTokenAmount = getTokenAmount;
exports.swapERC20Token = swapERC20Token;
exports.swapNativeToken = swapNativeToken;