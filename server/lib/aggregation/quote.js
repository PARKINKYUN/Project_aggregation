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
    // 보내고 받는 두 토큰의 세부 정보와 수량, 최적으로 선택된 swap 프로토콜 정보 및 예상 가스비는
    // 모두 마지막 res.json() 객체에 담겨 있습니다.
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

            // ** 받는 토큰의 수량을 고정했을 때 역견적을 받는 것은 swap 프로토콜마다 AMM 의 차이가 있고,
            // AMM과 수수료 계산 방법에 의해 교환되는 토큰의 수량이 일정 비율로 변하는 것이 아니기 때문에
            // 모든 dapp에 적용할 수 있는 범용적 공식은 존재하지 않습니다.
            // 따라서 보내는 수량을 조절하여 받는 토큰의 갯수가 나올 때까지 api 요청을 보내되,
            // 최소의 요청 횟수로 최적화시키는 방법을 사용하기로 하였습니다.

            // ** 이분탐색 알고리즘을 변형하여 적용해 보았습니다.
            // 1. 보내는 수량을 임의로 설정하여 받는 토큰 수량을 얻는다.
            // 2. 보내는 수량과 받는 수량의 대략적인 비율대로 받는 토큰의 고정수량과 맞는 보내는 토큰 수량을 재설정한다.
            // 3. 재설정한 토큰으로 견적을 받아 받는 수량을 체크한다.
            // 4. 받는 수량이 원하는(고정된) 수량보다 적으면 일정 단위 g 만큼 보내는 수량을 증가시키고 g를 1/2로 줄인다.
            // 5. 받는 수량이 원하는(고정된) 수량보다 많으면 일정 단위 g 만큼 보내는 수량을 감소시키고 g를 1/2로 줄인다.
            // 6. 받는 수량이 원하는(고정된) 수량과 동일할 때까지 3~5를 반복한다.
            // ** 일정 단위로 사용된 g 를 세밀하게 조정하면 최적화시키는데 도움이 되지만 시간복잡도 log(n)이기 때문에 큰 영향은 없을 듯 합니다.
            // ** 다만 시간당 1inch api 요청 건수 제한으로 아래 로직은 자주 멈춥니다...ㅠㅠ
            // ** 그래서 다른 방법이 있을까 생각해보았고, 해당 방법은 바로 구현할 수 있는 부분은 아니라서 아래 로직 이후에 글로 표현해두었습니다.

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

            // ** 받는 토큰의 수량을 고정했을 때 보내는 토큰의 수량을 구하는 두 번째 방법
            // 1. 프로토콜 종류마다 AMM 역산 방법을 저장한 라이브러리를 만들어 사용한다.
            // 2. 보내는 토큰을 임의로 설정하여 최적의 견적을 받아 swap 프로토콜을 알아낸다.{ protocols[0][0].part }
            // 3. 해당 프로토콜의 일련번호(part) 값을 통해 라이브러리에서 보내는 토큰의 수량을 구해 반환한다.
            //    또는 해당 프로토콜이 역산 함수를 제공하는 경우 해당 함수를 사용하여 보내는 토큰의 수량을 구한다.
            // ** 이 방법의 경우 1inch에서 지원하는 모든 swap protocols 의 AMM 에 대한 정리가 선행되어야 하나,
            //    swap 프로토콜의 수가 제한적이라는 것을 고려하면 가능하다고 생각합니다.

        } catch (err) {
            console.error(err)
            return new Error(err)
        }
    },
}