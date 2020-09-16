const lineReader = require('line-reader');
const fs = require('fs')

const fullList = []
lineReader.eachLine('../resources/lista.csv', function (line) {
    const parsed = line.split(',')[0].replace(/^/g, '').replace(/~/g, '')
    fs.appendFileSync('./parseddata.csv', `${parsed},`)
})

