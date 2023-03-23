const aggregator = require("../lib");

// slippage 는 추후 사용자의 선택에 의해 값이 변경되도록 할 수 있습니다.
const slippage = 1;

module.exports = {
    executeSwap: async (req, res) => {
        try {
            const {data} = req.body;
            const walletAddress = process.env.WALLET_ADDRESS;
            const privateKey = process.env.WALLET_PRIVATE_KEY;
            const web3RpcUrl = process.env.RPC_URL;
            console.log(walletAddress, privateKey, web3RpcUrl);
            const txHash = await aggregator.executeSwap(data, walletAddress, privateKey, web3RpcUrl, slippage);
            return res.status(200).send({data: txHash, message: "Swap successfully"});

        } catch (err) {
            return res.status(400).send({data:null, message: "Can't execute request"});
        }
    },

    quoteSwap: async (req, res) => {
        try {
            const {fromTokenAddress, toTokenAddress, amount} = req.body;
            const quoteData = await aggregator.getQuote(fromTokenAddress, toTokenAddress, amount);
            return res.status(200).send({data: quoteData, message: "Search quote successfully"})

        } catch (err) {
            return res.status(400).send({data:null, message: "Can't execute request"});
        }
    },

    quoteSwapFor: async (req, res) => {
        try {
            const {fromTokenAddress, toTokenAddress, toAmount} = req.body;
            const quoteData = await aggregator.getQuoteFor(fromTokenAddress, toTokenAddress, toAmount);
            return res.status(200).send({data: quoteData, message: "Search quote successfully"})

        } catch (err) {
            return res.status(400).send({data:null, message: "Can't execute request"});
        }
    },
}