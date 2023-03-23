'use strict';

const urls = require("./urls");
const approve = require("./approve");
const tx = require("./transaction");

// create raw transaction data for swap
const buildTxForSwap = async (swapParams) => {
    const url = urls.getRequestUrl('/swap', swapParams);

    return fetch(url)
    .then(res => res.json())
    .then(res => res.tx);
}

module.exports = {
    // execute swap
    executeSwap: async (quoteData, walletAddress, privateKey, web3RpcUrl, slippage) => {
        try {
            const fromTokenAddress = quoteData.fromToken.address;
            const toTokenAddress = quoteData.toToken.address;
            const amount = quoteData.fromTokenAmount;

            const approvedAmount = await approve.checkAllowance(fromTokenAddress, walletAddress);

            // approve 가 안되어 있거나, allowance 의 양이 amount 보다 작다면 다시 approve 를 한다.
            if(Number(approvedAmount) < Number(amount)){
                const addAmount = Number(amount) - Number(approvedAmount);
                const transactionHash = await approve.approveToken(fromTokenAddress, addAmount, privateKey, web3RpcUrl);

                console.log("Approved allowance for Swap", transactionHash);
            }

            // swap 을 위한 params 객체 생성
            const swapParams = {
                fromTokenAddress: fromTokenAddress,
                toTokenAddress: toTokenAddress,
                amount: amount,
                fromAddress: walletAddress,
                slippage: slippage,
                disableEstimate: false,
                allowPartialFill: false,
            };

            const swapTransaction = await buildTxForSwap(swapParams);
            const swapTxHash = await tx.signAndSendTransaction(swapTransaction, privateKey, web3RpcUrl);

            return swapTxHash;
        } catch (err) {
            console.error(err)
            return new Error(err)
        }
    },

    // 서명을 받을 swap 원시 트랜잭션 데이터 반환 함수
    getSwapTransaction: async (quoteData, walletAddress, slippage) => {
        const swapParams = {
            fromTokenAddress: quoteData.fromToken.address,
            toTokenAddress: quoteData.toToken.address,
            amount: quoteData.fromTokenAmount,
            fromAddress: walletAddress,
            slippage: slippage,
            disableEstimate: false,
            allowPartialFill: false,
        };
        return await buildTxForSwap(swapParams);
    },
}