const AlphaVantage = require('../lib/AlphaVantage')
const Marketstack = require('../lib/Marketstack')
const fs = require('fs')
const logger = require('../helper/logger')
const moment = require('moment')
// const instrumentsArray = require('../resources/nyse').instrumentsArray
const SLEEP = 700

const instrumentsArray = ['ORLY', 'OXY', 'ODFL', 'OMC', 'OKE', 'ORCL', 'OTIS', 'PCAR', 'PKG', 'PH', 'PAYX', 'PAYC', 'PYPL', 'PNR', 'PBCT', 'PEP', 'PKI', 'PRGO', 'PFE', 'PM', 'PSX', 'PNW', 'PXD', 'PNC', 'PPG', 'PPL', 'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PSA', 'PHM', 'PVH', 'QRVO', 'QCOM', 'PWR', 'DGX', 'RL', 'RJF', 'RTX', 'O', 'REG', 'REGN', 'RF', 'RSG', 'RMD', 'RHI', 'ROK', 'ROL', 'ROP', 'ROST', 'RCL', 'SPGI', 'CRM', 'SBAC', 'SLB', 'STX', 'SEE', 'SRE', 'NOW', 'SHW', 'SPG', 'SWKS', 'SLG', 'SNA', 'SO', 'LUV', 'SWK', 'SBUX', 'STT', 'STE', 'SYK', 'SIVB', 'SYF', 'SNPS', 'SYY', 'TMUS', 'TROW', 'TTWO', 'TPR', 'TGT', 'TEL', 'FTI', 'TDY', 'TFX', 'TXN', 'TXT', 'BK', 'CLX', 'COO', 'HSY', 'MOS', 'TRV', 'DIS', 'TMO', 'TIF', 'TJX', 'TSCO', 'TT', 'TDG', 'TFC', 'TWTR', 'TYL', 'TSN', 'USB', 'UDR',]

// const instrumentsArray = ['PEP']

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

function getPrice(days) {
    instrumentsArray.forEach(element => {
        const objectsArray = []
        ab.getDailyGainers(element).then((res) => {
            let dailyData = res['Time Series (Daily)']
            for (var [key, value] of Object.entries(dailyData)) {
                objectsArray.push({ date: key, data: value })
            }
            let latest = objectsArray[0].data['4. close']
            let oldest = objectsArray[days].data['4. close']
            console.log(`${element} latest price is ${latest} with date ${objectsArray[0].date}`)
            console.log(`${element} oldest price is ${oldest} with date ${objectsArray[days].date}`)
            if (parseInt(latest) > parseInt(oldest)) {
                console.log(`${element} price increased`)
            } else {
                console.log(`${element}price decreased`)
            }
        })
    });
}

function isMACDSweet() {
    let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    data.forEach(element => {
        if (element.isSweetPoint.isSweet) {
            console.log(`${element.symbol} is sweet`)
        }
    });
}

ab = new AlphaVantage()
// isMACDSweet()
// getPrice(1)
// m = new Marketstack()
// m.getEOD()
// console.log(getRSITopGainers(20))
// console.log(getMACDTopGainers(50))
// var date = moment().subtract(1, "days").format("YYYY-MM-DD");
const dates = ['2020-09-18', '2020-09-17', '2020-09-16', '2020-09-15', '2020-09-14']
getMACData(dates)
// ab.getFundamental('POM')
// ab.getCrypto()