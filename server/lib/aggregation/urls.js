'use strict';

const apiBaseUrl = "https://api.1inch.io/v5.0/137"
const getRequestUrl = (methodName, queryParams) => {
    return apiBaseUrl + methodName + "?" + (new URLSearchParams(queryParams)).toString();
}

module.exports = { getRequestUrl };