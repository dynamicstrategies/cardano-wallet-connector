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
- you can clone the git repo and then `npm instal`l and `npm start run` to start a local session

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

### Troubleshooting
- If you get an error that starts with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory ...` then run this `export NODE_OPTIONS="--max-old-space-size=8192"` before runnig `npm start`
- If you get an error that starts with ` Not enough ADA leftover to include non-ADA assets in a change address ...` then first make sure that you have enough ADA in your wallet and then try changing the "strategy" number in this part of the code `txBuilder.add_inputs_from(txUnspentOutputs, 1)` which determines how it selects available UTXOs from your wallet. The options are `0` for LargestFirst, `1` for RandomImprove, `2` for LargestFirstMultiAsset and `3` for RandomImproveMultiAsset 
- Requires Nodejs version v14 or higher

### Live Demo

A demo of the DApp is running here:
https://dynamicstrategies.io/wconnector

### Useful Links

These links serve as example of how to use the cardano-serialization-lib and where you can find code snippets

Implements the CIP30: https://cips.cardano.org/cips/cip30/

Uses the cardano-serialization-lib:

Link1: https://docs.cardano.org/cardano-components/cardano-serialization-lib

Link2: https://github.com/Emurgo/cardano-serialization-lib

NFT implementation: https://github.com/MartifyLabs/martify.frontend

Nami implementation: https://github.com/Berry-Pool/nami-wallet

Wallet interface: https://github.com/HarmonicPool/cardano-wallet-interface
