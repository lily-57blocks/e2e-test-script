# Script to run the e2e test of dex-aggregator's swap api


## How to use this test script

-  Start dex-aggragtor in local with port:3000

-  Prepre environment: FORK_URL, CHAIN_ID

-  Run `npm install` to install the dependencies 

-  Run script with `npx hardhat run ./scripts/runTest.js --network hardhat`


*** Note: make sure the CHAIN_ID is match the swap api's Chain id ***

*** Note: make sure the CHAIN_ID and FORK_URL are matched ***