import React from 'react'
import { Tab, Tabs } from "@blueprintjs/core";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/normalize.css/normalize.css";
import {
    Address,
    MultiAsset,
    Assets,
    ScriptHash,
    AssetName,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionOutput,
    Value,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    TransactionOutputBuilder,
    LinearFee,
    BigNum,
    BigInt,
    TransactionHash,
    TransactionInput,
    TransactionWitnessSet,
    Transaction,
    PlutusData,
    hash_transaction,
    hash_plutus_data
} from "@emurgo/cardano-serialization-lib-asmjs"
let Buffer = require('buffer/').Buffer


export default class App extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            selectedTabId: "1",
            walletFound: false,
            walletIsEnabled: false,
            walletName: undefined,
            walletIcon: undefined,
            walletAPIVersion: undefined,

            networkId: undefined,
            Utxos: undefined,
            balance: undefined,
            changeAddress: undefined,
            rewardAddress: undefined,
            usedAddress: undefined,

            txBody: undefined,
            txBodyCborHex_unsigned: "",
            txBodyCborHex_signed: "",
            submittedTxHash: ""

        }

        this.API = undefined;


        this.protocolParams = {
            linearFee: {
                minFeeA: "44",
                minFeeB: "155381",
            },
            minUtxo: "34482",
            poolDeposit: "500000000",
            keyDeposit: "2000000",
            maxValSize: 5000,
            maxTxSize: 16384,
            priceMem: 0.0577,
            priceStep: 0.0000721,
            coinsPerUtxoWord: "34482",
        }


    }

    handleTabId = (tabId) => this.setState({selectedTabId: tabId})

    checkIfWalletFound = () => {
        const walletFound = !!window?.cardano?.ccvault
        this.setState({walletFound})
        return walletFound;
    }

    checkIfWalletEnabled = async () => {

        let walletIsEnabled = false;

        try {
            walletIsEnabled = await window.cardano.ccvault.isEnabled();
            this.setState({walletIsEnabled})

        } catch (err) {
            console.log(err)
        }

        return walletIsEnabled
    }

    enableWallet = async () => {
        try {
            this.API = await window.cardano.ccvault.enable();
            await this.checkIfWalletEnabled();
            await this.getNetworkId();


        } catch (err) {
            console.log(err)
        }
    }

    getAPIVersion = () => {
        const walletAPIVersion = window?.cardano?.ccvault.apiVersion
        this.setState({walletAPIVersion})
        return walletAPIVersion;
    }

    getWalletName = () => {
        const walletName = window?.cardano?.ccvault.name
        this.setState({walletName})
        return walletName;
    }

    getNetworkId = async () => {
        try {
            const networkId = await this.API.getNetworkId();
            this.setState({networkId})

        } catch (err) {
            console.log(err)
        }
    }

    getUtxos = async () => {

        let Utxos = [];

        try {
            const rawUtxos = await this.API.getUtxos();

            for (const rawUtxo of rawUtxos) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
                const input = utxo.input();
                const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
                const txindx = input.index();
                const output = utxo.output();
                const amount = output.amount().coin().to_str();
                const obj = {
                    txid: txid,
                    txindx: txindx,
                    amount: amount,
                    str: `${txid} #${txindx} = ${amount}`,
                    TransactionUnspentOutput: utxo
                }
                Utxos.push(obj);
                // console.log(`utxo: ${str}`)
            }
            this.setState({Utxos})
        } catch (err) {
            console.log(err)
        }
    }

    getBalance = async () => {
        try {
            const balanceCBORHex = await this.API.getBalance();

            const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
            this.setState({balance})

        } catch (err) {
            console.log(err)
        }
    }

    getChangeAddress = async () => {
        try {
            const raw = await this.API.getChangeAddress();
            const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
            this.setState({changeAddress})
        } catch (err) {
            console.log(err)
        }
    }

    getRewardAddresses = async () => {

        try {
            const raw = await this.API.getRewardAddresses();
            const rawFirst = raw[0];
            const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({rewardAddress})

        } catch (err) {
            console.log(err)
        }
    }

    getUsedAddresses = async () => {

        try {
            const raw = await this.API.getUsedAddresses();
            const rawFirst = raw[0];
            const usedAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({usedAddress})

        } catch (err) {
            console.log(err)
        }
    }

    refreshData = async () => {
        try{
            const walletFound = this.checkIfWalletFound();
            if (walletFound) {
                await this.enableWallet();
                await this.getAPIVersion();
                await this.getWalletName();
                await this.getUtxos();
                await this.getBalance();
                await this.getChangeAddress();
                await this.getRewardAddresses();
                await this.getUsedAddresses();
            }
        } catch (err) {
            console.log(err)
        }
    }

    signTransaction = async () => {
        try{
            const txBodyCborHex_signed = await this.API.signTx(this.state.txBodyCborHex_unsigned);
            this.setState({txBodyCborHex_signed});
        } catch (err) {
            console.log(err)
        }

    }

    submitTransaction = async () => {
        try{
            const witness = TransactionWitnessSet.from_bytes(Buffer.from(this.state.txBodyCborHex_signed, "hex"));
            const tx = Transaction.new(this.state.txBody, witness)
            const txCborHex = Buffer.from(tx.to_bytes(), "hex").toString("hex")
            const submittedTxHash = await this.API.submitTx(txCborHex);
            console.log(submittedTxHash)
            this.setState({submittedTxHash});
        } catch (err) {
            console.log(err)
        }

    }

    initTransactionBuilder = async () => {

        const txBuilder = TransactionBuilder.new(
            TransactionBuilderConfigBuilder.new()
                .fee_algo(LinearFee.new(BigNum.from_str(this.protocolParams.linearFee.minFeeA), BigNum.from_str(this.protocolParams.linearFee.minFeeB)))
                .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
                .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
                .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
                .max_value_size(this.protocolParams.maxValSize)
                .max_tx_size(this.protocolParams.maxTxSize)
                .build()
        );

        return txBuilder
    }

    getTxUnspentOutputs = async () => {
        let txOutputs = TransactionUnspentOutputs.new()
        for (const utxo of this.state.Utxos) {
            txOutputs.add(utxo.TransactionUnspentOutput)
        }
        return txOutputs
    }



    buildSendADATransaction = async () => {

        const txBuilder = await this.initTransactionBuilder();


        // Output address - the main output address where you want to send the funds
        const shelleyOutputAddress = Address.from_bech32("addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm");
        // Change address - YOUR address where you want to receive the change from the transaction
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str('1800000'))
            ),
        );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 0)


        // set the time to live - the absolute slot value before the tx becomes invalid
        txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();
        const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        this.setState({txBodyCborHex_unsigned, txBody})

    }


    buildSendTokenTransaction = async () => {

        const txBuilder = await this.initTransactionBuilder();

        // Output address - the main output address where you want to send the funds
        const shelleyOutputAddress = Address.from_bech32("addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm");
        // Change address - YOUR address where you want to receive the change from the transaction
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
        txOutputBuilder = txOutputBuilder.next();

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from("4c494645", "hex")), // Asset Name
            BigNum.from_str("5") // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from("ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f", "hex")), // PolicyID
            assets
        );

        txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 2)


        // set the time to live - the absolute slot value before the tx becomes invalid
        txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();
        const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        this.setState({txBodyCborHex_unsigned, txBody})

    }



    buildSendAdaToPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();

        // Output address - the main output address where you want to send the funds
        const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
        // Change address - YOUR address where you want to receive the change from the transaction
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str("12345678")))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();

        txOutputBuilder = txOutputBuilder.with_value(Value.new(BigNum.from_str('6550000')))
        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 0)


        // set the time to live - the absolute slot value before the tx becomes invalid
        txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();
        const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        this.setState({txBodyCborHex_unsigned, txBody})
    }

    buildSendTokenToPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();

        // Output address - the main output address where you want to send the funds
        const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
        // Change address - YOUR address where you want to receive the change from the transaction
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str("12345678")))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from("4c494645", "hex")), // Asset Name
            BigNum.from_str("1") // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from("ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f", "hex")), // PolicyID
            assets
        );

        txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))

        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 3)


        // set the time to live - the absolute slot value before the tx becomes invalid
        txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();
        const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        this.setState({txBodyCborHex_unsigned, txBody})
    }

    buildRedeemFromPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();

        // Output address - the main output address where you want to send the funds
        const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
        // Change address - YOUR address where you want to receive the change from the transaction
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str("12345678")))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from("4c494645", "hex")), // Asset Name
            BigNum.from_str("1") // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from("ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f", "hex")), // PolicyID
            assets
        );

        txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))

        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 3)


        // set the time to live - the absolute slot value before the tx becomes invalid
        txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();
        const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        this.setState({txBodyCborHex_unsigned, txBody})
    }



    async componentDidMount() {
        await this.refreshData();
    }

    render()
    {

        return (
            <div style={{margin: "20px"}}>



                <h2>Boilerplate for CCVault DApp connector</h2>
                <p>{`Wallet Found: ${this.state.walletFound}`}</p>
                <button style={{padding: "10px"}} onClick={this.refreshData}>Connect to Wallet</button>

                <p>{`Wallet Connected: ${this.state.walletIsEnabled}`}</p>
                <p>{`Wallet API version: ${this.state.walletAPIVersion}`}</p>
                <p>{`Wallet name: ${this.state.walletName}`}</p>

                <p>{`Network Id: ${this.state.networkId} (0 = testnet; 1 = mainnet)`}</p>
                <p>UTXOs: {this.state.Utxos?.map(x => <li key={x.txid}>{x.str}</li>)}</p>
                <p>{`Balance: ${this.state.balance}`}</p>
                <p>{`Change Address: ${this.state.changeAddress}`}</p>
                <p>{`Staking Address: ${this.state.rewardAddress}`}</p>
                <p>{`Used Address: ${this.state.usedAddress}`}</p>
                <hr/>

                <Tabs id="TabsExample" vertical={true} onChange={this.handleTabId} selectedTabId={this.state.selectedTabId}>
                    <Tab id="1" title="1. Send ADA to Address" panel={
                        <div>
                            <h2>Send ADA - Transaction Builder</h2>
                            <button style={{padding: "10px"}} onClick={this.buildSendADATransaction}>1. Build Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>
                        </div>
                    } />
                    <Tab id="2" title="2. Send Token to Address" panel={
                        <div>
                        <h2>Send Token - Transaction Builder</h2>
                            <button style={{padding: "10px"}} onClick={this.buildSendTokenTransaction}>1. Build Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>
                        </div>
                    } />
                    <Tab id="3" title="3. Send ADA to Plutus Script" panel={
                        <div>
                            <h2>Send ADA to Plutus Script - Transaction Builder</h2>
                            <button style={{padding: "10px"}} onClick={this.buildSendAdaToPlutusScript}>1. Build Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>
                        </div>
                    } />
                    <Tab id="4" title="4. Send Token to Plutus Script" panel={
                        <div>
                            <h2>Send Token to Plutus Script - Transaction Builder</h2>
                            <button style={{padding: "10px"}} onClick={this.buildSendTokenToPlutusScript}>1. Build Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>
                            <button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>
                        </div>
                    } />
                    <Tabs.Expander />
                </Tabs>

                <hr/>
                <br/>
                <p>{`Unsigned txBodyCborHex: ${this.state.txBodyCborHex_unsigned}`}</p>
                <p>{`Signed txBodyCborHex: ${this.state.txBodyCborHex_signed}`}</p>
                <p>{`Submitted Tx Hash: ${this.state.submittedTxHash}`}</p>
                <p>{this.state.submittedTxHash ? 'check your wallet !' : ''}</p>



            </div>
        )
    }
}