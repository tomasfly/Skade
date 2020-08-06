const AlphaVantage = require('../lib/AlphaVantage')

ab = new AlphaVantage()
    ab.getDailyPrice('tsla')
    // ab.getIntraDayAdvanced('aapl', 'full', 'json', '60min')
// ab.backTest();