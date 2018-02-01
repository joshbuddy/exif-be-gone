const stream = require('stream')

const app1Marker = Buffer.from('ffe1', 'hex')
const exifMarker = Buffer.from('457869660000', 'hex') // Exif\0\0

module.exports = class ExifTransformer extends stream.Transform {
  constructor (options) {
    super(options)
    this.remainingBytes = null
  }

  _transform (chunk, encoding, callback) {
    if (chunk.length === 0) return callback()
    if (this.remainingBytes === null) {
      var app1Start = chunk.indexOf(app1Marker)
      if (app1Start === -1 || !chunk.slice(app1Start + 4, app1Start + 10).equals(exifMarker)) {
        this.push(chunk)
        return callback()
      }

      this.remainingBytes = chunk.readInt16BE(app1Start + 2)
      this.push(chunk.slice(0, app1Start))
      chunk = chunk.slice(app1Start)
    }

    if (chunk.length > this.remainingBytes + 1) {
      this.push(chunk.slice(this.remainingBytes + 1))
      this.remainingBytes = null
    } else {
      this.remainingBytes -= chunk.length
    }
    callback()
  }

  _flush (callback) {
    callback()
  }

  _final (callback) {
    callback()
  }
}
