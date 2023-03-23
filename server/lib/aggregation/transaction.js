'use strict';

const Web3 = require("web3");
const broadcastApiUrl = 'https://tx-gateway.1inch.io/v1.1/137/broadcast';

// broadCasting transaction in 1inch node.
const broadCastRawTransaction = (rawTransaction) => {
    return fetch(broadcastApiUrl, {
        method: 'post',
        body: JSON.stringify({rawTransaction}),
        headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then(res => res.transactionHash);
};

module.exports = {
    // sign & send transaction in 1inch node.
    signAndSendTransaction: async (rawTransactionData, privateKey, web3RpcUrl) => {
        const web3 = new Web3(web3RpcUrl);
        const {rawTransaction} = await web3.eth.accounts.signTransaction(rawTransactionData, privateKey);

        return await broadCastRawTransaction(rawTransaction);
    }
}
