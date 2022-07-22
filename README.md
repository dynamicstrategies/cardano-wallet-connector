# Cardano DApp Wallet Connector

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### React JS demo

In the project directory, you can run: `npm start run`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


### What is this useful for:
You can use this code as a starting point for the following:
- you are building a DApp and want to connect to the user's wallet (Nami, CCVault, or Flint)
- you want to read the balance, the UTXOs and the available tokens at the user's wallet
- you want the user to interact with your DApp
- you want the user to send transactions to the Cardano blockchain using their wallet
- you want the user to lock ADA and Tokens at a Plutus Script
- you want the user to redeem ADA and Tokens that have been locked at the Plutus Script

This boilerplate code was written in javascript and React Js, so caters to the devs who already use this framework.

### How does it work:
- It uses the wallet connector standard CIP30 and the cardano-serialization-lib
- the CIP30 standard has been implemented by Nami, CCvault and Flint
- It uses the cardano-serializatioon-lib to build transactions in the javascript front-end, then sign them and send the transactrons with the user's wallet
- you can clone the git repo and then `npm install` and `npm start run` to start a local session

### What does it do:
- send ADA to an address
- send Tokens (NFTs) to an address
- lock ADA at a Plutus Script
- lock Tokens (NFTs) at a Plutus Script
- redeem ADA from a Plutus Script
- redeem Tokens (NFTs) from a Plutus Script

### Things to keep in mind:
- The cardano-serialization-lib can be used to create transacations in the front end using javascript. It has the potential to simplify some of the plutus off chain code. As an example for the use case above only the On Chain Plutus smart contract was used while all of the Off Chain was done with the cardano-serialization-lib. This greatly reduced the amount of code that needs to be written in Haskell and avoid needing to interact with Plutus Application Backend
- The use cases use the "alwayssucceeds.plutus" Plutus Smart contract that always succeeds.
- The Plutus Script Address is derived from plutus script itself, so the contract has the same address for everyone: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8"
- The cardano-serialization-lib is constantly being updated and the release from v9 to v10 has breaking changes. This repo uses v10 of the cardano-serialization-lib

### Vasil Hard Fork - update to the Cost Model
The hard fork introduces changes to the cost model that determines how much it costs to run
scripts on the Cardano network. This is relevant when you need to redeem assets from scripts, or execute script code
onchain. Sending assets to a script address is not affected by the cost model.

The cost model in this repo has been updated for the hard fork and will work as intended on the testnet and on the Mainnet after the vasil hard fork. But it will not work on the Mainnet out of the box before the Vasil hard fork

- If you are using the repo on the Testnet - it should just work (default)
- If you are using the repo on the Mainnet after the Vasil hard fork - it should just work
- If you are using the repo on the Mainnet before the Vasil hard fork - you need to change the cost model in the model back to pre-vasil hard fork. The old, pre vasil hard fork, cost model is commented out in the code and starts with `const cost_model_vals = [197209, 0, 1...`

For reference - Pre-Vasil Cost model:

```javascript
const cost_model_vals = [
            197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 
            0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 
            29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 
            32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 
            425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000, 
            10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32, 
            150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 
            145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 
            32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 
            1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 
            2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 
            1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 
            150000, 32, 3345831, 1, 1
        ];
```

For reference - Post-Vasil Cost model:

```javascript
const cost_model_vals = [
            205665, 812, 1, 1, 1000, 571, 0, 1, 1000, 24177, 4, 1, 1000, 32, 117366,
            10475, 4, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000, 100, 23000,
            100, 100, 100, 23000, 100, 19537, 32, 175354, 32, 46417, 4, 221973, 511, 0, 1,
            89141, 32, 497525, 14068, 4, 2, 196500, 453240, 220, 0, 1, 1, 1000, 28662, 4,
            2, 245000, 216773, 62, 1, 1060367, 12586, 1, 208512, 421, 1, 187000, 1000,
            52998, 1, 80436, 32, 43249, 32, 1000, 32, 80556, 1, 57667, 4, 1000, 10,
            197145, 156, 1, 197145, 156, 1, 204924, 473, 1, 208896, 511, 1, 52467, 32,
            64832, 32, 65493, 32, 22558, 32, 16563, 32, 76511, 32, 196500, 453240, 220, 0,
            1, 1, 69522, 11687, 0, 1, 60091, 32, 196500, 453240, 220, 0, 1, 1, 196500,
            453240, 220, 0, 1, 1, 806990, 30482, 4, 1927926, 82523, 4, 265318, 0, 4, 0,
            85931, 32, 205665, 812, 1, 1, 41182, 32, 212342, 32, 31220, 32, 32696, 32,
            43357, 32, 32247, 32, 38314, 32, 9462713, 1021, 10,
        ];
```

### Troubleshooting
- If you get an error that starts with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory ...` then run this `export NODE_OPTIONS="--max-old-space-size=8192"` before runnig `npm start`
- If you get an error that starts with ` Not enough ADA leftover to include non-ADA assets in a change address ...` then first make sure that you have enough ADA in your wallet and then try changing the "strategy" number in this part of the code `txBuilder.add_inputs_from(txUnspentOutputs, 1)` which determines how it selects available UTXOs from your wallet. The options are `0` for LargestFirst, `1` for RandomImprove, `2` for LargestFirstMultiAsset and `3` for RandomImproveMultiAsset 
- Requires Nodejs version v14 or higher

### Live Demos

A demo showcasing all functionalities of the wallet connector:

https://dynamicstrategies.io/wconnector

A working integration of the wallet connector into the Cardano Beam App:

https://cardanobeam.app/web

### Guide on the Cardano Developer Portal
Explanation of the different section of the code

https://developers.cardano.org/docs/get-started/cardano-serialization-lib/create-react-app 

### Useful Links

These links serve as example of how to use the cardano-serialization-lib and where you can find code snippets

Implements the CIP30: https://cips.cardano.org/cips/cip30/

Uses the cardano-serialization-lib:

Link1: https://docs.cardano.org/cardano-components/cardano-serialization-lib

Link2: https://github.com/Emurgo/cardano-serialization-lib

NFT implementation: https://github.com/MartifyLabs/martify.frontend

Nami implementation: https://github.com/Berry-Pool/nami-wallet

Wallet interface: https://github.com/HarmonicPool/cardano-wallet-interface
