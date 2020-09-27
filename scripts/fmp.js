const FMP_API_KEY = ''
// https://financialmodelingprep.com/developer/docs/#Company-Quote
const https = require('https')

const options = {
  hostname: 'financialmodelingprep.com',
  port: 443,
  path: `/api/v3/quote/AAPL?apikey=${FMP_API_KEY}`,
  method: 'GET'
}

const req = https.request(options, (res) => {
  res.on('data', (d) => {
    process.stdout.write(d)
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.end()