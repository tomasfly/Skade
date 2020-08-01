const alpha = require('alphavantage')({ key: 'KPP2RDW11G9G5TWV' });

class AlphaVantage {
    constructor() {}
    getIntraday(symbol) {
        let counter = 0;
        let upPrice = 0;
        alpha.data.intraday(symbol).then(data => {
            const res = data['Time Series (1min)']
            for (let key in res) {
                let open = res[key]['1. open'];
                let close = res[key]['4. close']
                if (close > open) {
                    upPrice++
                }
                counter++
            }
            // console.log(upPrice)
        });
    }

    getIntraDayAdvanced(symbol, outputsize, datatype, interval) {
        let counter = 0;
        let upPrice = 0;
        alpha.data.intraday(symbol, outputsize, datatype, interval).then(data => {
            const res = data;
            console.log(res)
        });
    }

    getDaily(symbol, outputsize, datatype, interval) {
        let counter = 0;
        let upPrice = 0;
        alpha.data.daily(symbol, outputsize, datatype, interval).then(data => {
            const res = data;
            console.log(res)
        });
    }
}

module.exports = AlphaVantage