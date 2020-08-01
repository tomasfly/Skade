const AlphaVantage = require('../lib/AlphaVantage')

ab = new AlphaVantage()
    // ab.getIntraday('aapl')
    // ab.getIntraDayAdvanced('aapl', 'full', 'json', '60min')
ab.getDaily('aapl', 'full', 'json', '60min')