const fs = require('fs');
const bigInt = require("big-integer");
const bn = require('bignumber.js');
const { getSwapAPIResponse } = require('./utils');
const { swapERC20Token, swapNativeToken} = require('./callSwap')
const { deployCallHelper } = require('./deployCallHelper')
const { initSenderUSDC } = require('./init')

const sender = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

const routerAddr = {
    "1": "0xe43ca1Dee3F0fc1e2df73A0745674545F11A59F5",
    "42161": "0x544bA588efD839d2692Fc31EA991cD39993c135F",
    "137": "0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e"
}

async function runTest(chainId) {
    await initSenderUSDC(chainId);
    const callHelperAddr = await deployCallHelper(routerAddr[chainId]);
    const data = fs.readFileSync(`./scripts/data/${chainId}-testData.csv`, 'utf8');
    const lines = data.split('\n');
    console.log("ChainId, InToken, OutToken, InAmount, ExpectedOutAmount, ActualOutAmount, Diff, DiffPercent")
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if(line.trim() == '') continue;
        const row = line.split(',');
        const requestParams = {
            chainId: parseInt(row[0].trim()),
            fromTokenAddress: row[1].trim(),
            toTokenAddress: row[2].trim(),
            fromAmount: row[3].trim(),
            toAddress: row[4].trim()
        };
        const swapAPIReturn = await getSwapAPIResponse(requestParams);
        if(!swapAPIReturn || swapAPIReturn.status != 'Success') {
            console.log(`Swap path ${JSON.stringify(requestParams)} => No way`)
            return
        }
        const value = swapAPIReturn.routes[0].transaction.value;
        const toUser = swapAPIReturn.toAddress;
        const toToken = swapAPIReturn.toTokenAddress;
        const inToken = swapAPIReturn.fromTokenAddress;
        const amount = swapAPIReturn.routes[0].fromAmount;
        const calldata = swapAPIReturn.routes[0].transaction.callData;
        let actualOutAmount = 0;
        if(value != "0"){
            actualOutAmount = await swapNativeToken(callHelperAddr, sender, toUser, toToken, amount, calldata);
        } else {
            actualOutAmount =await swapERC20Token(callHelperAddr, sender, toUser, inToken, toToken, amount, calldata)
        }

        const outAmount = swapAPIReturn.routes[0].toAmount;
        const outAmountBI = bigInt(outAmount);
        const actualOutAmountBI = bigInt(actualOutAmount);
        const diff = outAmountBI.minus(actualOutAmountBI).abs();
        const diffPercent = bn(diff).dividedBy(bn(outAmountBI)).multipliedBy(100);
        console.log(`${row[0]}, ${inToken}, ${toToken}, ${amount}, ${swapAPIReturn.routes[0].toAmount}, ${actualOutAmount}, ${diff}, ${diffPercent}%`)
    }
}
const chainId = process.env.CHAIN_ID | '1'

runTest(chainId).then(() => {
    console.log("finished");
}).catch((error) => {
    console.log(error.message);
    process.exit(1);
})
