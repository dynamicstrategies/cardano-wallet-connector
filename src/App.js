import React from 'react'
import {
    Address,
    TransactionUnspentOutput,
    TransactionOutput,
    Value,
    TransactionBuilder,
    LinearFee,
    BigNum,
    hash_transaction,
    TransactionHash,
    TransactionInput,
    ByronAddress,
    PublicKey,
    PrivateKey,
    Bip32PublicKey,
    TransactionWitnessSet,
    Transaction
} from "@emurgo/cardano-serialization-lib-asmjs"
let Buffer = require('buffer/').Buffer

const MAX_VALUE_SIZE = 50000000000;
const MAX_TX_SIZE = 16384;

export default class App extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
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

        this.minFeeA = '44';
        this.minFeeB = '155381';
        this.minUTxOValue = '1000000';
        this.poolDeposit = '500000000';
        this.keyDeposit= '2000000';


    }

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
                    str: `${txid} #${txindx} = ${amount}`
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

    buildTransaction = async () => {

        const txBuilder = TransactionBuilder.new(
            // all of these are taken from the genesis settings
            // linear fee parameters (a*size + b)
            LinearFee.new(BigNum.from_str(this.minFeeA), BigNum.from_str(this.minFeeB)),
            // minimum utxo value
            BigNum.from_str(this.minUTxOValue),
            // pool deposit
            BigNum.from_str(this.poolDeposit),
            // key deposit
            BigNum.from_str(this.keyDeposit),
            MAX_VALUE_SIZE,
            MAX_TX_SIZE
        );


        txBuilder.add_input(
            Address.from_bech32("addr_test1qrrcpzsemawptnru8k865mvq0awd7slp2eaeg4qa0xjyjdyc85y96hdkqtarg95gewuezjvkw8zt530tnmglhrzccddsannl6x"),
            TransactionInput.new(
                TransactionHash.from_bytes(
                    Buffer.from("d641394b01c67d4f121b73973cfe90c34d6fc0f3f77723852271baad30585db5", "hex")
                ), // tx hash
                0, // index
            ),
            Value.new(BigNum.from_str('1000000000'))
        )


        // Output address
        const shelleyOutputAddress = Address.from_bech32("addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm");
        // Change address
        // const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)
        const shelleyChangeAddress = Address.from_bech32("addr_test1qz98zdc8nv3h5ydaqwyaxynz75mzjhdtydgags4f9xjjpm5c85y96hdkqtarg95gewuezjvkw8zt530tnmglhrzccddskxtxye")

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str('1000000'))
            ),
        );

        // set the time to live - the absolute slot value before the tx becomes invalid
        txBuilder.set_ttl(49666886);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();
        const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        this.setState({txBodyCborHex_unsigned, txBody})

        // const txHash = hash_transaction(txBody);

        // console.log(txBody)
        // console.log(txHash.to_bech32("hash_"))

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



    async componentDidMount() {
        await this.refreshData();
    }

    render()
    {

        return (
            <div style={{margin: "20px"}}>

                <h2>Boilerplate for CCVault DApp connector</h2>
                <p>{`Wallet Found: ${this.state.walletFound}`}</p>
                <button style={{padding: "10px"}} onClick={this.enableWallet}>Connect to Wallet</button>

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
                <h2>Transaction Builder</h2>
                <button style={{padding: "10px"}} onClick={this.buildTransaction}>1. Build Transaction</button>
                <p>{`Unsigned txBodyCborHex: ${this.state.txBodyCborHex_unsigned}`}</p>
                <button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>
                <p>{`Signed txBodyCborHex: ${this.state.txBodyCborHex_signed}`}</p>
                <button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>
                <p>{`Submitted Tx Hash: ${this.state.submittedTxHash}`}</p>

            </div>
        )
    }
}