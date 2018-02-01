const toStream = require('buffer-to-stream')
const fs = require('fs')
const ExifTransformer = require('./index')
const img = fs.readFileSync('./Canon_40D.jpg')
console.log(img)

const writer = fs.createWriteStream('out.jpg')

toStream(img).pipe(new ExifTransformer()).pipe(writer)
