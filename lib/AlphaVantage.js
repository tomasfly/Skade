const alpha = require('alphavantage')({ key: process.env.alphavantage_api_key });
const fs = require('fs')
const logger = require('../helper/logger')
const axios = require('axios');
const moment = require('moment')

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

    // same as the above but only store value when macd is higher than macd signal
    async getMACDDifferenceMacdUp(instrument, date) {
        let difference;
        let returnArray = []
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                Object.entries(objsArray).forEach(([key, value]) => {
                    if (key === date) {
                        const maxValue = Math.max(value.MACD_Signal, value.MACD)
                        const minValue = Math.min(value.MACD_Signal, value.MACD)
                        const macd = value.MACD
                        const macd_signal = value.MACD_Signal
                        difference = maxValue - minValue
                        if (parseFloat(macd) > parseFloat(macd_signal)) {
                            returnArray.push({ date: key, rawData: value, difference: difference })
                        }
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

    // possible use for swing trading
    async getMACDDifferenceMacdUpManualDates(instrument, dates) {
        let difference;
        let returnArray = []
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                const maxValue = Math.max(objsArray[dates[0]].MACD_Signal, objsArray[dates[0]].MACD)
                const minValue = Math.min(objsArray[dates[0]].MACD_Signal, objsArray[dates[0]].MACD)
                const macd = objsArray[dates[0]].MACD
                const macd_signal = objsArray[dates[0]].MACD_Signal
                difference = maxValue - minValue
                if (parseFloat(macd) > parseFloat(macd_signal)) {
                    if (parseFloat(objsArray[dates[2]].MACD) < parseFloat(objsArray[dates[2]].MACD_Signal)) {
                        if (parseFloat(objsArray[dates[3]].MACD) < parseFloat(objsArray[dates[3]].MACD_Signal)) {
                            console.log(instrument)
                            console.log('Logging sequence first macd dates 0,2,3 and then signal 0,2,3')
                            console.log(objsArray[dates[0]].MACD)
                            console.log(objsArray[dates[2]].MACD)
                            console.log(objsArray[dates[3]].MACD)
                            console.log(objsArray[dates[0]].MACD_Signal)
                            console.log(objsArray[dates[2]].MACD_Signal)
                            console.log(objsArray[dates[3]].MACD_Signal)
                        }
                    }
                    // returnArray.push({ date: key, rawData: value, difference: difference })
                }
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

    async getMACDCrossingBaseLine(instrument, dates) {
        let returnArray = []
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                const macdFirst = Math.sign(parseFloat(objsArray[dates[0]].MACD))
                const macdSecond = Math.sign(parseFloat(objsArray[dates[1]].MACD))
                if (macdFirst === 1 && macdSecond === -1) {
                    console.log(`Match for ${instrument}`)
                }
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

    // macd crosses baseline or macd is above baseline and crosses signal
    async getMACDCrossingBaseLineCryptos(instrument, dates) {
        let returnArray = []
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                const macd = Math.sign(parseFloat(objsArray[dates[0]].MACD))                
                const signal = Math.sign(parseFloat(objsArray[dates[0]].MACD_Signal))
                const macdToday = parseFloat(objsArray[dates[0]].MACD)
                const macdYesterday = parseFloat(objsArray[dates[1]].MACD)
                const signalToday = parseFloat(objsArray[dates[0]].MACD_Signal)
                const signalYesterday = parseFloat(objsArray[dates[1]].MACD_Signal)
                if(macd === 1 && signal === 1){
                    if (macdToday > signalToday){
                        if(macdYesterday < signalYesterday){
                            console.log(`Match for ${instrument}`)
                        }
                    }
                }

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

    async getMACDSweetPoint(instrument, dates) {
        let yesterday = dates[0]
        let yesterdayMinusOne = dates[1]
        let yesterdayMinusTwo = dates[2]
        let yesterdayMinusThree = dates[3]
        let yesterdayMinusFour = dates[4]
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                // Check if MACD is below Signal
                let MACDYesterday = parseFloat(objsArray[yesterday].MACD)
                let MACDSignalYesterday = parseFloat(objsArray[yesterday].MACD_Signal)
                if (MACDYesterday < MACDSignalYesterday) {
                    // is below signal, now check if MACD has been falling and there is a turn
                    if (MACDYesterday > parseFloat(objsArray[yesterdayMinusOne].MACD)) {
                        if (parseFloat(objsArray[yesterdayMinusOne].MACD) < parseFloat(objsArray[yesterdayMinusTwo].MACD)) {
                            if (parseFloat(objsArray[yesterdayMinusTwo].MACD) < parseFloat(objsArray[yesterdayMinusThree].MACD)) {
                                if (parseFloat(objsArray[yesterdayMinusThree].MACD) < parseFloat(objsArray[yesterdayMinusFour].MACD)) {
                                    return true
                                }
                            }
                        }
                    }
                }
            });
            return false
        }
        catch (e) {
            logger.warn(`${instrument} ${e}`)
            return false
        }
    }

    async getMACDSweetPointManualDates(instrument, dates) {
        let yesterday = dates[0]
        let yesterdayMinusOne = dates[1]
        let yesterdayMinusTwo = dates[2]
        let yesterdayMinusThree = dates[3]
        let yesterdayMinusFour = dates[4]
        let raw = {}
        let isSweet = false
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                raw = {
                    yesterday: { raw: objsArray[yesterday], date: yesterday },
                    yesterdayMinusOne: { raw: objsArray[yesterdayMinusOne], date: yesterdayMinusOne },
                    yesterdayMinusTwo: { raw: objsArray[yesterdayMinusTwo], date: yesterdayMinusTwo },
                    yesterdayMinusThree: { raw: objsArray[yesterdayMinusThree], date: yesterdayMinusThree },
                    yesterdayMinusFour: { raw: objsArray[yesterdayMinusFour], date: yesterdayMinusFour }
                }
                // Check if MACD is below Signal
                let MACDYesterday = parseFloat(objsArray[yesterday].MACD)
                let MACDSignalYesterday = parseFloat(objsArray[yesterday].MACD_Signal)
                if (MACDYesterday < MACDSignalYesterday) {
                    // is below signal, now check if MACD has been falling and there is a turn
                    if (MACDYesterday >= parseFloat(objsArray[yesterdayMinusOne].MACD)) {
                        if (parseFloat(objsArray[yesterdayMinusOne].MACD) < parseFloat(objsArray[yesterdayMinusTwo].MACD)) {
                            if (parseFloat(objsArray[yesterdayMinusTwo].MACD) < parseFloat(objsArray[yesterdayMinusThree].MACD)) {
                                if (parseFloat(objsArray[yesterdayMinusThree].MACD) < parseFloat(objsArray[yesterdayMinusFour].MACD)) {
                                    isSweet = true
                                }
                            }
                        }
                    }
                }
            });
            return { raw: raw, isSweet: isSweet }
        }
        catch (e) {
            logger.warn(`${instrument} ${e}`)
            return { raw: raw, isSweet: false }
        }
    }

    async getMACDDecelPointManualDates(instrument, dates) {
        let yesterday = dates[0]
        let yesterdayMinusOne = dates[1]
        let yesterdayMinusTwo = dates[2]
        let yesterdayMinusThree = dates[3]
        let yesterdayMinusFour = dates[4]
        let raw = {}
        let isSweet = false
        try {
            await alpha.technical.macd(instrument, 'daily', 'close', 12, 26, 9).then(data => {
                const array = Object.entries(data);
                const objsArray = array[1][1]
                raw = {
                    yesterday: { raw: objsArray[yesterday], date: yesterday },
                    yesterdayMinusOne: { raw: objsArray[yesterdayMinusOne], date: yesterdayMinusOne },
                    yesterdayMinusTwo: { raw: objsArray[yesterdayMinusTwo], date: yesterdayMinusTwo },
                    yesterdayMinusThree: { raw: objsArray[yesterdayMinusThree], date: yesterdayMinusThree },
                    yesterdayMinusFour: { raw: objsArray[yesterdayMinusFour], date: yesterdayMinusFour }
                }
                // Check if MACD is below Signal
                let MACDYesterday = parseFloat(objsArray[yesterday].MACD)
                let MACDSignalYesterday = parseFloat(objsArray[yesterday].MACD_Signal)
                if (MACDYesterday < MACDSignalYesterday) {
                    // last record should also be less than previous one. We just need to look for deceleration compared to function getMACDSweetPointManualDates
                    if (MACDYesterday < parseFloat(objsArray[yesterdayMinusOne].MACD)) {
                        // calculate drop percentage
                        const diff1 = parseFloat(objsArray[yesterdayMinusOne].MACD) - MACDYesterday
                        const drop1 = Math.abs((diff1 / parseFloat(objsArray[yesterdayMinusOne].MACD)) * 100)
                        if (parseFloat(objsArray[yesterdayMinusOne].MACD) < parseFloat(objsArray[yesterdayMinusTwo].MACD)) {

                            const diff2 = parseFloat(objsArray[yesterdayMinusTwo].MACD) - parseFloat(objsArray[yesterdayMinusOne].MACD)
                            const drop2 = Math.abs((diff2 / parseFloat(objsArray[yesterdayMinusTwo].MACD)) * 100)

                            if (parseFloat(objsArray[yesterdayMinusTwo].MACD) < parseFloat(objsArray[yesterdayMinusThree].MACD)) {

                                const diff3 = parseFloat(objsArray[yesterdayMinusThree].MACD) - parseFloat(objsArray[yesterdayMinusTwo].MACD)
                                const drop3 = Math.abs((diff3 / parseFloat(objsArray[yesterdayMinusThree].MACD)) * 100)

                                if (parseFloat(objsArray[yesterdayMinusThree].MACD) < parseFloat(objsArray[yesterdayMinusFour].MACD)) {

                                    const diff4 = parseFloat(objsArray[yesterdayMinusFour].MACD) - parseFloat(objsArray[yesterdayMinusThree].MACD)
                                    const drop4 = Math.abs((diff4 / parseFloat(objsArray[yesterdayMinusFour].MACD)) * 100)
                                    if ((drop1 < drop2) && (drop2 < drop3) && (drop3 < drop4)) {
                                        // These ifs are to ensuse drop1 and drop2 are below 10 and if drop3 and drop4 are between 10 and 20, it is a sweetest point
                                        // if ((Math.floor(drop1) <= 10 && Math.floor(drop2) <= 10)) {
                                        //     console.log(instrument)
                                        //     console.log('Sweet!')
                                        //     if ((Math.floor(drop3) < 20 && Math.floor(drop4) < 20) && (Math.floor(drop3) > 10 && Math.floor(drop4) > 10)) {
                                        //         console.log('Extreme sweetness!!!')
                                        //     }
                                        //     console.log(`${drop1}`)
                                        //     console.log(`${drop2}`)
                                        //     console.log(`${drop3}`)
                                        //     console.log(`${drop4}`)
                                        // }
                                        console.log(`${instrument}`)
                                        console.log(`${drop1}`)
                                        console.log(`${drop2}`)
                                        console.log(`${drop3}`)
                                        console.log(`${drop4}`)
                                    }
                                    isSweet = true
                                }
                            }
                        }
                    }
                }
            });
            return { raw: raw, isSweet: isSweet }
        }
        catch (e) {
            logger.warn(`${instrument} ${e}`)
            return { raw: raw, isSweet: false }
        }
    }

    async getWeeklyPercentagePrice(instrument, days = 20) {
        let sum = 0
        let final
        try {
            await alpha.data.daily(instrument, 'compact', 'json', '60min').then(data => {
                const array = Object.entries(data);
                const measureObjects = Object.entries(array[1][1]);
                for (let index = 0; index < days; index++) {
                    const closingPrice = parseFloat(measureObjects[index][1]['4. close'])
                    const previousClosingPrice = parseFloat(measureObjects[index + 1][1]['4. close'])

                    if (previousClosingPrice > closingPrice) {
                        const difference = previousClosingPrice - closingPrice
                        const percentageChange = (difference / previousClosingPrice) * 100
                        final = - Math.abs(percentageChange)
                    }
                    else {
                        const difference = closingPrice - previousClosingPrice
                        const percentageChange = (difference / previousClosingPrice) * 100
                        final = percentageChange
                    }
                    sum += final
                }
            });
            return sum
        }
        catch (e) {
            logger.warn(`${instrument} ${e}`)
            return null
        }
    }

    // return actual difference but also calculate that line has been rising in the last 2 or 3 days
    // async getRisingTrendMACD(){
    // }

    // Measure volatility
    //https://www.alphavantage.co/documentation/#bbands
    // async getBollingerBands() {

    // }

    // https://www.alphavantage.co/documentation/#atr
    // async getAtr() {

    // }

    // perform a function which gets which set of symbols are in the three groups
    async getMonthlyGainers(instrument) {
        let res
        // get all symbols in the last month. Take average price and get the top 10
        await alpha.data.monthly(instrument, 'compact', 'json').then((data) => {
            res = data
        });
    }

    async getDailyGainers(instrument) {
        let res
        await alpha.data.daily(instrument, 'compact', 'json').then((data) => {
            res = data
        });
        return res
    }
    async getSemestralGainers() {
        // Same
    }

    async getFundamental(symbol) {
        const params = {
            apikey: process.env.alphavantage_api_key,
            function: 'OVERVIEW',
            symbol: symbol,
        }
        axios.get('https://www.alphavantage.co/query', { params })
            .then(response => {
                console.log(response.data)

            }).catch(error => {
                console.log(response);
            });

    }

    async getCrypto() {
        await alpha.crypto.daily('ada', 'usd').then(data => {
            console.log(data);
        });

        // await alpha.technical.macd('btc', 'daily', 'close', 12, 26, 9).then(data => {
        //     console.log(data)
        // })
    }

    // rule 1 swing trading
    // ADX(14) is higher than 30
    // ADX(14) in this period is higher than ADX(14) in the last period
    // Current bar high is higher than SMA(20) and current bar low is lower than SMA(20)

    // rule 2 swing trading
    // EMA(13) in this period is higher than EMA(13) in the last period
    // MACD(12,26,9) in this period is higher than MACD(12,26,9) in the last period
}

module.exports = AlphaVantage