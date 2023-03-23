'use strict';

const checkToken = require("./checktoken");
const urls = require("./urls");

// get optimum quote
const getOptimumQuote = (fromTokenAddress, toTokenAddress, amount) => {
    const requestUrl = urls.getRequestUrl("/quote", {fromTokenAddress, toTokenAddress, amount});
    return fetch(requestUrl)
    .then(res => res.json());
}

module.exports = {
    // get quote by exact tokens.
    getQuote: async (fromTokenAddress, toTokenAddress, amount) => {
        try {
            // Swap이 지원되는 토큰이 아니면 Error 객체 반환
            if(!checkToken.isSupportedToken(fromTokenAddress)
            ||
            !checkToken.isSupportedToken(toTokenAddress)) {
                return new Error("No supported token");
            }

            return await getOptimumQuote(fromTokenAddress, toTokenAddress, amount);
        } catch (err) {
            console.error(err)
            return new Error(err);
        }
    },

    // get quote for exact tokens.
    getQuoteFor: async (fromTokenAddress, toTokenAddress, toAmount) => {
        try {
            // Swap이 지원되는 토큰이 아니면 Error 객체 반환
            if(!checkToken.isSupportedToken(fromTokenAddress)
            ||
            !checkToken.isSupportedToken(toTokenAddress)) {
                return new Error("No supported token");
            }

            // 리팩토링이 필요하다.
            // 임의로 보내는 토큰의 양을 정하여 받는 토큰의 양을 구했을 때,
            // 우선 해당 비율대로 보내는 토큰의 양을 설정한다.
            // 이후 보내는 토큰의 양으로 다시 받는 토큰의 최소 보장량을 구하고,
            // 최소 보장량에 따라 크든 작든 g 를 재설정하는 방법으로 수정할 예정이다.

            const exFromAmount = "10000000000000";
            const exData = await getOptimumQuote(fromTokenAddress, toTokenAddress, exFromAmount);
            const exToAmount = exData.toTokenAmount;

            let auxFromAmount = parseInt((Number(exFromAmount) * Number(toAmount)) / Number(exToAmount));
            let auxData = await getOptimumQuote(fromTokenAddress, toTokenAddress, auxFromAmount.toString());
            let auxToAmount = auxData.toTokenAmount;
            let g = 10000;

            while(auxToAmount !== toAmount){
                if(Number(auxToAmount) < Number(toAmount)){
                    auxFromAmount += g;
                } else {
                    auxFromAmount -= g;
                }

                auxData = await getOptimumQuote(fromTokenAddress, toTokenAddress, auxFromAmount.toString());
                auxToAmount = auxData.toTokenAmount;
                g = Math.ceil(g / 2);
            }

            return auxData;

        } catch (err) {
            console.error(err)
            return new Error(err)
        }
    },
}