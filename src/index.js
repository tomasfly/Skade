const AlphaVantage = require('../lib/AlphaVantage')
const Marketstack = require('../lib/Marketstack')
const fs = require('fs')
const logger = require('../helper/logger')
const moment = require('moment')
// const instrumentsArray = require('../resources/nyse').instrumentsArray

// const instrumentsArray = ['MRNA', 'TESLA', 'UBER', 'JQC', 'JDD', 'DIAX', 'NDMO', 'JEMD', 'NEV', 'JFR', 'JRO', 'NKG', 'JGH', 'JHY', 'NXC', 'NXN', 'NID', 'NMY', 'NMT', 'NUM', 'NMS', 'NOM', 'JLS', 'JMM', 'NHA', 'NZF', 'NMCO', 'NMZ', 'NMI', 'NJV']


const instrumentsArray = ['MRNA', 'TSLA', 'UBER', 'JQC', 'NEV', 'DIAX', 'JEMD', 'NZF', 'WORK', 'C']

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

function getData(date) {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = {}
        ab.getMACDDifference(element, date).then((macd) => {
            ab.getRSI(element, date).then((rsi) => {
                instumentAnalysis = { symbol: element, RSI: rsi, MACD: macd }
                fs.appendFileSync('./data.json', `${JSON.stringify(instumentAnalysis)},`)
            })
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

ab = new AlphaVantage()

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

getPrice(1)

// m = new Marketstack()
// m.getEOD()
// console.log(getRSITopGainers(5))
// console.log(getMACDTopGainers(5))
// var date = moment().subtract(1, "days").format("YYYY-MM-DD");
// getData(date)
// ab.getFundamental('POM')