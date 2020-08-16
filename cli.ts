#!/usr/bin/env node

import ExifBeGone from './index'
import { createReadStream, createWriteStream } from 'fs'

const [,, ...args] = process.argv

const reader = createReadStream(args[0])
const writer = createWriteStream(args[1])

reader.pipe(new ExifBeGone()).pipe(writer).on('finish', () => {
	console.log(`Finishing removing exif data from ${args[0]}, written to ${args[1]}`)
})