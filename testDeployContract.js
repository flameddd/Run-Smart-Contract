var fs = require('fs');
var solc = require('solc');
var Web3 = require('web3');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var ethSignConf = require('./config').etherum.BASE;


let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethSignConf.URL));
if (!web3.isConnected()) {
    console.log('unable to connect to ethereum node at ' + ethSignConf.URL);
    throw new Error('unable to connect to ethereum node at ' + ethSignConf.URL);
}




web3.personal.unlockAccount(ethSignConf.ACCOUNT, ethSignConf.PASSWORD);
/*Compile Contract and Fetch ABI*/
let source = fs.readFileSync("./contracts/TicketDistribution.sol", 'utf8');
let compiledContract = solc.compile(source);
for (let contractName in compiledContract.contracts) {
    // console.log('contractName =' + contractName);
    if (contractName == ':TicketDistribution') {
        // console.log(contractName + ': ' + compiledContract.contracts[contractName].bytecode);
        // console.log(contractName + '; ' + JSON.parse(compiledContract.contracts[contractName].interface));
        var bytecode = compiledContract.contracts[contractName].bytecode;
        var abi = JSON.parse(compiledContract.contracts[contractName].interface);
    }
}
fs.writeFile("contracts/ABI.json", JSON.stringify(abi), function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The ABI.json file was saved!");
});
fs.writeFile("contracts/bytecode", bytecode, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The bytecode file was saved!");
});
// let gasEstimate = web3.eth.estimateGas({ data: '0x' + bytecode });+
// console.log("gasEstimate =" + gasEstimate);
let MyContract = web3.eth.contract(abi);
console.log("abi=" + abi);
var evnetName = "test deploy contract";
var description = "temp description ";
var preview = "temp preview";
console.log("bytecode =" + bytecode);
let contractData = MyContract.new.getData(evnetName, description, preview, { data: '0x' + bytecode });
let estimate = web3.eth.estimateGas({ data: contractData });
console.log("estimate =" + estimate);

console.log('deploying contract...');
let contract = MyContract.new(evnetName, description, preview, {
    from: ethSignConf.ACCOUNT,
    data: '0x' + bytecode,
    gas: estimate + 30000
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// We need to wait until any miner has included the transaction in a block to get the address of the contract
(async(function waitBlock() {
    while (true) {
        let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
        if (receipt && receipt.contractAddress) {
            console.log("Your contract has been deployed at " + receipt.contractAddress);
            console.info("deployed info : etherum URL : " + ethSignConf.URL);
            console.info("etherum ACCOUNT : " + ethSignConf.ACCOUNT);
            console.info("etherum PASSWORD : " + ethSignConf.PASSWORD);
            console.info("deployed gas estimate :" + estimate + 30000);
            console.info("description =" + description);
            console.log("TransactionReceipt =" + JSON.stringify(receipt));
            console.log('TransactionHash =' + receipt.transactionHash);
            console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
            console.log('=====start to send reply========');
            console.log('=====finished sending reply========');
            break;
        }
        console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
        await (sleep(500));
    }
}))();