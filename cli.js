#!/usr/bin/env node

const ExifBeGone = require('./index')
const fs = require('fs')

const [,, ...args] = process.argv

const reader = fs.createReadStream(args[0])
const writer = fs.createWriteStream(args[1])

reader.pipe(new ExifBeGone()).pipe(writer).on('finish', () => {
  console.log(`Finishing removing exif data from ${args[0]}, written to ${args[1]}`)
})
