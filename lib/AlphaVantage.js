const alpha = require('alphavantage')({ key: '' });

const fs = require('fs')
const logger = require('../helper/logger')

class AlphaVantage {
    constructor() { }
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

    getDailyPrice(symbol) {
        alpha.data.daily(symbol, 'compact', 'json', '60min').then(data => {
            const res = data
            console.log(res)

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

    //https://www.investopedia.com/terms/p/percentage-change.asp#:~:text=Understanding%20Percentage%20Change&text=If%20the%20price%20increased%2C%20use,multiply%20that%20number%20by%20100.

    backTest(arrayOfSymbols = ['tsla']) {
        let final = 0
        arrayOfSymbols.forEach(sym => {
            alpha.data.daily(sym, 'compact', 'json').then(data => {
                const res = data['Time Series (Daily)'];
                console.log(sym)
                for (let key in res) {
                    console.log(key)
                    console.log(res[key])
                    const open = parseFloat(res[key]['1. open'])
                    const close = parseFloat(res[key]['4. close'])
                    if (close < open) {
                        console.log('this should have closed negative')
                        const diff = ((open - close) / open)
                        final = diff * 100
                    } else {
                        console.log('this should have closed positive')
                        const diff = ((close - open) / open)
                        final = diff * 100
                    }
                    console.log(final)
                }
            });
        });
    }

    async getRSI(instrument, date) {
        let rsi
        let returnArray = []
        try {
            await alpha.technical.rsi(instrument, `daily`, 14, `close`).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                Object.entries(objsArray).forEach(([key, value]) => {
                    if (key === date) {
                        rsi = value.RSI
                        returnArray.push({ date: key, rawData: value, rsi: rsi })
                    }
                });
            });
            if (returnArray.length === 0) {
                returnArray.push({ date: date, rawData: null, rsi: null })
            }
            return returnArray
        }
        catch (e) {
            logger.warn(`${instrument} ${e}`)
            returnArray.push({ date: date, rawData: null, rsi: null })
            return returnArray
        }

    }

    getMACD(instrument) {
        alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
            const array = Object.entries(data);
            const objsArray = array[1][1]
            let counter = 0
            const macdsArray = [];
            Object.entries(objsArray).forEach(([key, value]) => {
                if (counter >= 0 && counter <= 50) {
                    console.log(JSON.stringify(key) + ' ' + JSON.stringify(value));
                }
                counter++
            });
        });

    }

    async getMACDDifference(instrument, date) {
        let difference;
        let returnArray = []
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                let counter = 0
                Object.entries(objsArray).forEach(([key, value]) => {
                    if (key === date) {
                        const maxValue = Math.max(value.MACD_Signal, value.MACD)
                        const minValue = Math.min(value.MACD_Signal, value.MACD)
                        difference = maxValue - minValue
                        returnArray.push({ date: key, rawData: value, difference: difference })
                    }
                });
            });
            if (returnArray.length === 0) {
                returnArray.push({ date: null, rawData: null, difference: null })
            }
            return returnArray
        }
        catch (e) {
            logger.warn(`${instrument} ${e}`)
            returnArray.push({ date: null, rawData: null, difference: null })
            return returnArray
        }
    }
}

module.exports = AlphaVantage