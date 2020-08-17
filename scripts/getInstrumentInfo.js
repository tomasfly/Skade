const alpha = require('alphavantage')({ key: 'KPP2RDW11G9G5TWV' });
const fs = require('fs')

// alpha.data.intraday('tsla').then(data => {
//     const res = data['Time Series (1min)']
//     fs.writeFileSync('./response.json', JSON.stringify(res))
// });

// alpha.technical.macd('tsla', '60min', 'close').then(data => {
//     // fs.writeFileSync('./response.json', JSON.stringify(res))
//     console.log(data)
// });

alpha.data.intraday('tsla').then(data => {
    const res = data['Time Series (1min)']
    fs.writeFileSync('./response.json', JSON.stringify(res))
});