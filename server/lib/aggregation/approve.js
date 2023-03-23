'use strict';

const checkToken = require("./checktoken");
const urls = require("./urls");
const tx = require("./transaction");
const Web3 = require("web3");

// create raw transaction data for approve
const buildTxForApproveTradeWithRouter = async (tokenAddress, amount, web3RpcUrl) => {
    const url = urls.getRequestUrl(
        '/approve/transaction',
        amount ? {tokenAddress, amount} : {tokenAddress}
    );

    const transaction = await fetch(url).then(res => res.json());

    const web3 = new Web3(web3RpcUrl);
    const gasLimit = await web3.eth.estimateGas({
        ...transaction,
        from: walletAddress
    });

    return {
        ...transaction,
        gas: gasLimit
    };
}

module.exports = {
    // check approve token
    checkAllowance: (tokenAddress, walletAddress) => {
        try {
            if(!checkToken.isSupportedToken(tokenAddress)) return new Error("No supported token");

            const requestUrl = urls.getRequestUrl("/approve/allowance", {tokenAddress, walletAddress});
            return fetch(requestUrl)
            .then(res => res.json())
            .then(res => res.allowance);
        } catch (err) {
            return new Error(err)
        }
    },

    // approve token
    approveToken: async (fromTokenAddress, addAmount, privateKey, web3RpcUrl) => {
        try {
            // build the body of the transaction
            const rawTransactionData = await buildTxForApproveTradeWithRouter(fromTokenAddress, addAmount, web3RpcUrl);
            return await tx.signAndSendTransaction(rawTransactionData, privateKey);
        } catch (err) {
            return new Error(err)
        }
    },

    // 개인키를 서버 메모리에 저장하지 않고, 서명되지 않은 raw transaction 을 client 로 보내 서명을 받아 처리하는 경우
    // 1. 서명을 받을 원시 트랜잭션 데이터를 생성하여 client 로 보낸다.
    // 2. client 에서 사용자가 원시 트랜잭션에 서명한 후 서명된 트랜잭션을 서버로 보내면 서버에서 처리한다.

    // ** 만약 1inch api 가 permit 을 지원한다면, approve 와 swap 모두 client로부터 permit 데이터를 받아와
    // ** 1inch api를 통해 처리하도록 하는 방법이 있을 것입니다.(이 경우 사용자의 gas 비용이 절약된다는 장점이 있으나 permit 지원 여부는 확인이 안됩니다.)

    // 서명을 받을 approve 원시 트랜잭션 데이터 반환하는 함수
    getApproveTransaction: async (tokenAddress, amount, web3RpcUrl) => {
        return await buildTxForApproveTradeWithRouter(tokenAddress, amount, web3RpcUrl);
    },
}