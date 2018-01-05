const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
var ethSignConf = require('./config').etherum.BASE;
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var recriptMode = require('./config').etherum.RECEIPTMODE;
/*
 * connect to ethereum node
 */
const ethereumUri = ethSignConf.URL;
var abii = '[{"constant":true,"inputs":[],"name":"eventId","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_a","type":"string"},{"name":"_b","type":"string"}],"name":"compare","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_a","type":"string"},{"name":"_b","type":"string"}],"name":"equal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to_userId","type":"string"},{"name":"ticketId","type":"string"}],"name":"attend","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"description","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userId","type":"string"},{"name":"ticketId","type":"string"}],"name":"getTicketDetail","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from_userId","type":"string"},{"name":"to_userId","type":"string"},{"name":"ticketId","type":"string"},{"name":"transactionId","type":"string"}],"name":"update","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"preView","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"string"},{"name":"_desc","type":"string"},{"name":"_view","type":"string"}],"name":"updateDesc","outputs":[{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to_userId","type":"string"},{"name":"ticketId","type":"string"},{"name":"transactionId","type":"string"}],"name":"add","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_id","type":"string"},{"name":"desc","type":"string"},{"name":"preview","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"string"},{"indexed":true,"name":"to","type":"string"},{"indexed":false,"name":"ticketId","type":"string"},{"indexed":false,"name":"transactionId","type":"string"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"string"},{"indexed":false,"name":"desc","type":"string"},{"indexed":false,"name":"preview","type":"string"}],"name":"eventInfo","type":"event"}]';
var abi = JSON.parse(abii);
var contractAddress = "0xfffa7a05c6506afe53b08e3b495e8fbe3f3e7778";

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(ethereumUri));

let balance = web3.eth.getBalance(ethSignConf.ACCOUNT);
console.log('balance:' + web3.fromWei(balance, 'ether') + " ETH");

let instance = web3.eth.contract(abi).at(contractAddress);

var description = instance.description();
console.log("description=" + description);

//=========getTicketDetail method=======================================
var res = instance.getTicketDetail("chris", "0x59b88eaca7247a057b2fafd1");
console.log("getTicketDetail result =" + res);
transactionStart = Date.now();
console.log("===============3=============");
// 
// console.log("===============unlockAccount=============");
//result = instance.add(param.to, param.ticket, param.txid, { from: ethSignConf.ACCOUNT, gas: gasEstimate + 30000 });
web3.personal.unlockAccount(ethSignConf.ACCOUNT, ethSignConf.PASSWORD);
result = instance.add(
    "chris", '0x59b88eaca7247a057b2fafd2',
    '0x7e4b184795f39144ca500290333111', { from: ethSignConf.ACCOUNT, gas: 300000 }
);

//update(string from_userId, string to_userId, string ticketId, string transactionId)
// result = instance.update(
//     "chris", "", '0x59b88eaca7247a057b2fafd1',
//     '0x7e4b184795f39144ca500290333112', { from: ethSignConf.ACCOUNT, gas: 500000 }
// );


console.log("result =" + JSON.stringify(result));


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// We need to wait until any miner has included the transaction
// in a block to get the address of the contract
(async(function waitBlock() {
    if (recriptMode === '0') {
        while (true) {
            let receipt = web3.eth.getTransactionReceipt(result);
            // console.log("receipt =" + JSON.stringify(receipt));
            if (receipt && receipt.blockNumber) {
                console.log("Your transaction has been execute at block " + receipt.blockNumber);
                console.log("TransactionReceipt =" + JSON.stringify(receipt));
                console.log('TransactionHash =' + receipt.transactionHash);
                console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
                transactionEnd = Date.now();
                console.log("get transaction receipt =" + transactionEnd + " transactionTime =" + (transactionEnd - transactionStart));
                break;
            }
            // console.log("Waiting a mined block to include your contract... currently in block " + web3.eth.blockNumber);
            await (sleep(100));
        }
    }
}))();