'use strict';

const apiBaseUrl = "https://api.1inch.io/v5.0/137"
// return true or false via list of tokens that are available for swap.
const isSupportedToken = (tokenAddress) => {
    try {
        const requestUrl = apiBaseUrl + "/tokens";
        return fetch(requestUrl)
        .then(res => res.json())
        .then(res => {
            if(res.tokens === undefined) return [];
            return Object.keys(res.tokens)
        })
        .then(res => res.includes(tokenAddress));

    } catch (err) {
        console.log(err)
        return new Error(err)
    }
}

module.exports = { isSupportedToken };