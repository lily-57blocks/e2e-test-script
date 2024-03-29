const axios = require('axios');


const API_URL = 'http://localhost:3000/swap';

async function getSwapAPIResponse(requestParams){
    const response = await axios.post(API_URL, requestParams);
    if(response.status == 200)
        return response.data;
    return undefined;
    
}

exports.getSwapAPIResponse = getSwapAPIResponse;