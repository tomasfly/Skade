const AlphaVantage = require('../lib/AlphaVantage')
const fs = require('fs')
const logger = require('../helper/logger')

ab = new AlphaVantage()

// const instrumentsArray = ['TSLA','MRNA','NVDA','PINS','AMZN','SNAP','SPOT','AAPL','YNDX','NTDOY','FB','CRM','ADBE','APHA','LUV','EBAY','WSM','NFLX','BABA','SVMK','MSFT','SIE','ATVI','TCTZ','AA','NKE','RACE','DAI','CAT','SAP','GOOGL','RYAAY','DBK','TWTR','SQM','VALE','HD','ORCL','NVTK','MA','DIS','SBUX','PG','EL','V','SK','RCL','UNH','GS','ETH','ADS','BIDU','MCD','JUVE','BMW','F','VZ','WEED','HOG','UBER','MTS','TM','JNJ','PFE','RNO','BAC','CSCO','LNVG','TRIP','DBX','VOW','SBER','BAS','AXP','VFC','BNP','IBM','JPM','AFLT','OGZPY','CRON','ROSN','ENEL','TRV','WYNN','KO','TIF','GMKN','PVH','PM','DG','HPQ','INTC','BSAC','PTR','FP','CHL','LUKOY','ITX','C','ENIC','BAYN','PBR','GILD','XOM','LYFT','SAVE','VOD','T','IDCB','KORS','ENI','AIR','RL','EDF','GE','CCL','NCLH','REP','WFC','AF','BA','TUI','ACB','TLRY','JWN','LTM']

const instrumentsArray = ['TSLA', 'MRNA', 'NVDA', 'PINS', 'AMZN', 'SNAP', 'SPOT', 'AAPL', 'YNDX', 'NTDOY', 'FB', 'CRM', 'ADBE', 'APHA', 'LUV', 'EBAY', 'WSM', 'NFLX', 'BABA', 'SVMK', 'MSFT', 'SIE', 'ATVI', 'AA', 'NKE', 'RACE', 'DAI', 'CAT', 'SAP', 'GOOGL', 'RYAAY', 'DBK', 'TWTR', 'SQM', 'VALE', 'HD', 'ORCL', 'MA', 'DIS', 'SBUX', 'PG', 'EL', 'V', 'SK', 'RCL', 'UNH', 'GS', 'ETH', 'ADS', 'BIDU', 'MCD', 'BMW', 'F', 'VZ', 'HOG', 'UBER', 'MTS', 'TM', 'JNJ', 'PFE', 'RNO', 'BAC', 'CSCO', 'TRIP', 'DBX', 'VOW', 'BAS', 'AXP', 'VFC', 'BNP', 'IBM', 'JPM', 'OGZPY', 'CRON', 'ROSN', 'TRV', 'WYNN', 'KO', 'TIF', 'PVH', 'PM', 'DG', 'HPQ', 'INTC', 'BSAC', 'PTR', 'FP', 'CHL', 'LUKOY', 'ITX', 'C', 'ENIC']
const returnArray = []

// This one works but analyze one instrument per time and the idea is to analyze all in parallel. That is to say send all requests to the server in parallel and wait for responses

async function techAnalysis() {
    let macd
    let rsi
    for (const element of instrumentsArray) {
        macd = await ab.getMACDDifference(element);
        rsi = await ab.getRSI(element)
        returnArray.push({ symbol: element, macd: macd, rsi: rsi })
    }
    console.log(JSON.stringify(returnArray))
}

// faster approach

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

const DATE = '2020-09-09'

async function getData() {
    if (fs.existsSync('./data.json')) {
        fs.unlinkSync('./data.json')
    }
    fs.writeFileSync('./data.json', '[]')
    logger.info(`Attempting to process ${instrumentsArray.length} instruments`)
    for (const element of instrumentsArray) {
        let instumentAnalysis = []
        ab.getMACDDifference(element, DATE).then((macd) => {
            ab.getRSI(element, DATE).then((rsi) => {
                instumentAnalysis.push({ symbol: element, RSI: rsi, MACD: macd })
                fs.readFile('./data.json', function (err, data) {
                    var json = JSON.parse(data);
                    json.push(instumentAnalysis);
                    fs.writeFileSync('./data.json', JSON.stringify(json))
                })
            })
        })
    }
}

// getData()

function AnalyzeData() {
    let differenceArray = []
    var data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    logger.info(`Analyzing ${data.length} instruments`)
    data.forEach(element => {
        differenceArray.push(element[0].MACD[0].difference)
    });
    let sortedArray = differenceArray.sort()
    lessDifference = sortedArray[0]
    const top_five = [sortedArray[0], sortedArray[1], sortedArray[2], sortedArray[3], sortedArray[4]]
    data.forEach(element => {
        if (top_five.includes(element[0].MACD[0].difference)) {
            logger.info(`Top five selection:${JSON.stringify(element)}`)
            logger.info(element[0].MACD[0].difference)
        }
    });
}
AnalyzeData()