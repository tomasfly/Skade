const AlphaVantage = require('../lib/AlphaVantage')

ab = new AlphaVantage()

// const instrumentsArray = ['TSLA','MRNA','NVDA','PINS','AMZN','SNAP','SPOT','AAPL','YNDX','NTDOY','FB','CRM','ADBE','APHA','LUV','EBAY','WSM','NFLX','BABA','SVMK','MSFT','SIE','ATVI','TCTZ','AA','NKE','RACE','DAI','CAT','SAP','GOOGL','RYAAY','DBK','TWTR','SQM','VALE','HD','ORCL','NVTK','MA','DIS','SBUX','PG','EL','V','SK','RCL','UNH','GS','ETH','ADS','BIDU','MCD','JUVE','BMW','F','VZ','WEED','HOG','UBER','MTS','TM','JNJ','PFE','RNO','BAC','CSCO','LNVG','TRIP','DBX','VOW','SBER','BAS','AXP','VFC','BNP','IBM','JPM','AFLT','OGZPY','CRON','ROSN','ENEL','TRV','WYNN','KO','TIF','GMKN','PVH','PM','DG','HPQ','INTC','BSAC','PTR','FP','CHL','LUKOY','ITX','C','ENIC','BAYN','PBR','GILD','XOM','LYFT','SAVE','VOD','T','IDCB','KORS','ENI','AIR','RL','EDF','GE','CCL','NCLH','REP','WFC','AF','BA','TUI','ACB','TLRY','JWN','LTM']

const instrumentsArray = ['MRNA']
const differences = []

async function techAnalysis() {
    let diff
    for (const element of instrumentsArray) {
        diff = await ab.getMACDDifference(element);
        differences.push({ symbol: element, difference: diff })
    }
    console.log(differences)
}

techAnalysis()

