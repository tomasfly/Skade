const AlphaVantage = require('../../lib/AlphaVantage')

jest.mock('alphavantage', () => jest.fn(() => ({
    data: {
        intraday: jest.fn()
    }
})))
test('Test', () => {
    ab = new AlphaVantage()
    ab.getIntraday('aapl')
})