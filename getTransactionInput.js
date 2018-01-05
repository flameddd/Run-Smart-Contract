const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder('contracts/ABI.json');
var ethConf = require('./config').etherum;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var Web3 = require('web3');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// get transaction input decode data
web3.eth.getTransaction("0x1af2fe4c06e3bd71122c4741588a40bf05e9ee317e208e0f27008ffb281e7a12", (error, txResult) => {
    //console.log("txResult =" + JSON.stringify(txResult.input));
    const result = decoder.decodeData(txResult.input);
    console.log("result =" + JSON.stringify(result));
});