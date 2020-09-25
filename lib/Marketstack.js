const axios = require('axios');
const params = {
    access_key: process.env.marketstack_api_key
}

class Marketstack {

    getEOD() {
        axios.get('http://api.marketstack.com/v1/tickers/aapl/eod', { params })
            .then(response => {
                const apiResponse = response.data.data;
                console.log(apiResponse)

            }).catch(error => {
                console.log(error);
            });
    }
}

module.exports = Marketstack