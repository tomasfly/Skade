const AlphaVantage = require('../../lib/AlphaVantage')


jest.mock('alphavantage', () => jest.fn(() => (
    {
        data: {
            intraday: jest.fn(() => ({
                then: jest.fn(() => "sdfsdf")
            }))
        },
        technical: {
            macd: jest.fn(() => Promise.resolve({
                "Meta Data": {
                    "1: Symbol": "BTCUSD",
                    "2: Indicator": "Moving Average Convergence/Divergence (MACD)",
                    "3: Last Refreshed": "2020-09-19",
                    "4: Interval": "daily",
                    "5.1: Fast Period": 12,
                    "5.2: Slow Period": 26,
                    "5.3: Signal Period": 9,
                    "6: Series Type": "close",
                    "7: Time Zone": "US/Eastern"
                },
                "Technical Analysis: MACD": {
                    "2020-09-19": {
                        "MACD_Signal": "-165.9123",
                        "MACD_Hist": "92.4393",
                        "MACD": "-170.4730"
                    },
                    "2020-09-18": {
                        "MACD_Signal": "-189.0222",
                        "MACD_Hist": "81.3378",
                        "MACD": "-220.6844"
                    },
                    "2020-09-17": {
                        "MACD_Signal": "-209.3566",
                        "MACD_Hist": "70.3810",
                        "MACD": "-210.9756"
                    },
                    "2020-09-16": {
                        "MACD_Signal": "-226.9519",
                        "MACD_Hist": "51.0439",
                        "MACD": "-200.9080"
                    },
                    "2020-09-15": {
                        "MACD_Signal": "-226.9519",
                        "MACD_Hist": "51.0439",
                        "MACD": "-190.9080"
                    },
                    "2020-09-14": {
                        "MACD_Signal": "-226.9519",
                        "MACD_Hist": "51.0439",
                        "MACD": "-180.9080"
                    }
                }
            }))
        }
    })))

test('getMACDSweetPoint()', async () => {
    ab = new AlphaVantage()
    await ab.getMACDSweetPoint('aapl').then((data) => {
        expect(data[0].symbol).toBe('aapl')
    })
})