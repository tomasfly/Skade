const AlphaVantage = require('../lib/AlphaVantage')
const Marketstack = require('../lib/Marketstack')
const fs = require('fs')
const logger = require('../helper/logger')
const moment = require('moment')
const instrumentsArray = require('../resources/nyse').instrumentsArray
const SLEEP = 700
ab = new AlphaVantage()

// const instrumentsArray = ['WTM']

// const instrumentsArray = ['UBER']

// This one works but analyze one instrument per time and the idea is to analyze all in parallel. That is to say send all requests to the server in parallel and wait for responses

async function techAnalysis() {
    const returnArray = []
    let macd
    let rsi
    for (const element of instrumentsArray) {
        macd = await ab.getMACDDifference(element);
        rsi = await ab.getRSI(element)
        returnArray.push({ symbol: element, macd: macd, rsi: rsi })
    }
    console.log(JSON.stringify(returnArray))
}


// faster approach with append file

async function getDataFirstApproach() {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '{}')
    for (const element of instrumentsArray) {
        let instumentAnalysis = []
        ab.getMACDDifference(element).then((macd) => {
            ab.getRSI(element).then((rsi) => {
                instumentAnalysis.push({ symbol: element, RSI: rsi, MACD: macd })
                fs.appendFile('data.json', `${JSON.stringify(instumentAnalysis)},`, function (err) {
                    if (err) throw err;
                });
            })
        })
    }
}

// previous day date yyyy-mm-dd
async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}


// used for getting RSI and MACD and signal which are very close to each other
// console.log(getRSITopGainers(20))
// const res = getMACDTopGainers(50)
// fs.writeFileSync('./res.json',JSON.stringify(res))
// date = '2020-09-24'
// getData(date)
async function getData(date) {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        await sleep(SLEEP)
        // ab.getMACDDifference(element, date).then((macd) => {
        ab.getMACDDifferenceMacdUp(element, date).then((macd) => {
            ab.getRSI(element, date).then((rsi) => {
                instumentAnalysis = { symbol: element, RSI: rsi, MACD: macd }
                fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
            })
        })
    }
}

// improvement on getData specifically on MACD to get golden cross
// const dates = ['2020-09-24', '2020-09-23', '2020-09-22', '2020-09-21', '2020-09-18']
// getData(dates)
// async function getData(date) {
//     if (fs.existsSync('./data.json')) {
//         fs.unlinkSync('./data.json')
//     }
//     fs.writeFileSync('./data.json', '')
//     logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
//     for (const element of instrumentsArray) {
//         let instumentAnalysis = {}
//         await sleep(SLEEP)
//         ab.getMACDDifferenceMacdUpManualDates(element, date).then((macd) => {
//             instumentAnalysis = { symbol: element, MACD: macd }
//             fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
//         })
//     }
// }

// Get MACD Crossing Baseline
const dates = ['2020-10-01', '2020-09-30']
getMACDCrossBaseline(dates)
async function getMACDCrossBaseline(dates) {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        await sleep(SLEEP)
        ab.getMACDCrossingBaseLine(element, dates).then((macd) => {
            instumentAnalysis = { symbol: element, MACD: macd }
            fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
        })
    }
}

// this one automatically gets dates
async function getMACData() {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        await sleep(SLEEP)
        ab.getMACDSweetPoint(element).then((isSweetPoint) => {
            instumentAnalysis = { symbol: element, isSweetPoint: isSweetPoint }
            fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
        })
    }
}

// getMACDData sweet point (when MACD crosses signal line)
// const dates = ['2020-09-23', '2020-09-22', '2020-09-21', '2020-09-18', '2020-09-17']
// getMACDataSweetPoint(dates)
// console.log(getMACDTopGainers(50))
async function getMACDataSweetPoint(dates) {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        await sleep(SLEEP)
        ab.getMACDSweetPoint(element, dates).then((isSweetPoint) => {
            instumentAnalysis = { symbol: element, isSweetPoint: isSweetPoint }
            fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
        })
    }
}




// sweet turnover point manual dates (I would say most suggested approach for now)
// async function getMACData(dates) {
//     if (fs.existsSync('./data.json')) {
//         fs.unlinkSync('./data.json')
//     }
//     fs.writeFileSync('./data.json', '')
//     logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
//     for (const element of instrumentsArray) {
//         let instumentAnalysis = {}
//         await sleep(SLEEP)
//         ab.getMACDSweetPointManualDates(element, dates).then((isSweetPoint) => {
//             instumentAnalysis = { symbol: element, isSweetPoint: isSweetPoint }
//             fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
//         })
//     }
// }



// deceleration point approach in progress below
// Patterns as the ones below which have deceleration frames < 10% seem to have good results
// Seems there is a deceleration pattern for CLX
// Logging sequence
// 0.9236651771317963
// 3.6529462324515443
// 10.223953261927935
// 15.162443932597897
// Seems there is a deceleration pattern for TSCO
// Logging sequence
// 3.295819935691322
// 3.385530574752861
// 5.9308683161894225
// 9.347925216598261
// Done in 356.05s.
// const dates = ['2020-09-23', '2020-09-22', '2020-09-21', '2020-09-18', '2020-09-17']
// getMACData(dates)
async function getMACData(dates) {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        await sleep(SLEEP)
        ab.getMACDDecelPointManualDates(element, dates).then((isSweetPoint) => {
            instumentAnalysis = { symbol: element, isSweetPoint: isSweetPoint }
            fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
        })
    }
}

function getMACDTopGainers(top) {
    let differenceArray = []
    let tops = []
    let topsObjs = []
    var data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    logger.info(`Analyzing ${data.length} instruments`)
    data.forEach(element => {
        differenceArray.push(element.MACD[0].difference)
    });
    let sortedArray = differenceArray.sort()
    lessDifference = sortedArray[0]
    for (let index = 0; index < top; index++) {
        tops.push(sortedArray[index])
    }
    tops.forEach(element => {
        data.forEach(rawElement => {
            if (rawElement.MACD[0].difference === element) {
                topsObjs.push({ MACDdifference: rawElement.MACD[0].difference, symbol: rawElement.symbol, date: rawElement.MACD[0].date })
            }
        });
    });
    return topsObjs
}

function getRSITopGainers(top) {
    let tops = []
    let topsObjs = []
    let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    let RSIArray = []
    data.forEach(element => {
        RSIArray.push(element.RSI[0].rsi)
    });
    let sortedArray = RSIArray.sort()
    for (let index = 0; index < top; index++) {
        tops.push(sortedArray[index])
    }

    tops.forEach(element => {
        data.forEach(rawElement => {
            if (rawElement.RSI[0].rsi === element) {
                topsObjs.push({ rsi: rawElement.RSI[0].rsi, symbol: rawElement.symbol, date: rawElement.RSI[0].date })
            }
        });
    });
    return topsObjs
}

// Think not useful
// function getPrice(days) {
//     instrumentsArray.forEach(element => {
//         const objectsArray = []
//         ab.getDailyGainers(element).then((res) => {
//             let dailyData = res['Time Series (Daily)']
//             for (var [key, value] of Object.entries(dailyData)) {
//                 objectsArray.push({ date: key, data: value })
//             }
//             let latest = objectsArray[0].data['4. close']
//             let oldest = objectsArray[days].data['4. close']
//             console.log(`${element} latest price is ${latest} with date ${objectsArray[0].date}`)
//             console.log(`${element} oldest price is ${oldest} with date ${objectsArray[days].date}`)
//             if (parseInt(latest) > parseInt(oldest)) {
//                 console.log(`${element} price increased`)
//             } else {
//                 console.log(`${element}price decreased`)
//             }
//         })
//     });
// }

function isMACDSweet() {
    let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    data.forEach(element => {
        if (element.isSweetPoint.isSweet) {
            console.log(`${element.symbol} is sweet`)
        }
    });
}


// the following two functions work together
// Surpsingly, what worked for me was to run function as getPriceGainers(5) --> worked quite smoothly with 10, 3, 2
// and the ones who had the lowest values: 
// { symbol: 'CCL', avg: -21.154733362583535, days: 5 }
// { symbol: 'NCLH', avg: -16.463127480527117, days: 5 }
// { symbol: 'BWA', avg: -13.18736635062368, days: 5 }
// { symbol: 'AIV', avg: -12.07961758905749, days: 5 }
// { symbol: 'COTY', avg: -11.179618989895543, days: 5 }
// Were the ones who are having highest increases


// interesting result in which the ones go grew the most in the last 3 days had great values for nyse:
// { symbol: 'CTRA', avg: 30.954822770130587, days: 3 } +11%
// { symbol: 'CUB', avg: 32.00831963374379, days: 3 } -8%
// { symbol: 'JE', avg: 38.80886796481225, days: 3 } +26%
// { symbol: 'RENN', avg: 39.92781321956862, days: 3 } +24%
// { symbol: 'SOL', avg: 63.7620001657659, days: 3 } -14%

// testing 2 days even better results!
// { symbol: 'CUB', avg: 26.125373920053505, days: 2 }-8,11%
// { symbol: 'RENN', avg: 29.533857322319925, days: 2 }+24,76%
// { symbol: 'JE', avg: 33.03148873597022, days: 2 }+26,16%
// { symbol: 'CVNA', avg: 36.00484938108824, days: 2 }+30,61%
// { symbol: 'PSV', avg: 39.588500115859496, days: 2 }+35,06%

// getPriceGainers() == 6 minutos para sp500
// getPriceGainers() == X minutos para nyse (sera una media hora)
// getPriceGainers(20)
// printSortPriceGainers()
async function getPriceGainers(days) {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        await sleep(SLEEP)
        ab.getWeeklyPercentagePrice(element, days).then((response) => {
            instumentAnalysis = { symbol: element, avg: response, days: days }
            fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
        })
    }

}

function printSortPriceGainers() {
    let data = JSON.parse(fs.readFileSync('./datasp50020daytopgainers.json', 'utf8'));
    let AVGArray = []
    data.forEach(element => {
        if (element.avg) {
            AVGArray.push(parseFloat(element.avg))
        }
    });

    AVGFinalArray = AVGArray.sort(function (a, b) {
        return a - b;
    });
    AVGFinalArray.forEach(elementFinal => {
        data.forEach(elementRaw => {
            if (parseFloat(elementRaw.avg) === elementFinal) {
                console.log({ symbol: elementRaw.symbol, avg: elementFinal, days: elementRaw.days })
            }
        });
    });
}

//////////////
//////////////

// isMACDSweet()
// getPrice(1)
// m = new Marketstack()
// m.getEOD()
// console.log(getRSITopGainers(50))

// console.log(getMACDTopGainers(50))
// var date = moment().subtract(1, "days").format("YYYY-MM-DD");
// var date = '2020-09-18'
// getData(date)

// ab.getFundamental('POM')
// ab.getCrypto()