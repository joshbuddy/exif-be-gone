const stream = require('stream')

const app1Marker = Buffer.from('ffe1', 'hex')
const exifMarker = Buffer.from('457869660000', 'hex') // Exif\0\0

module.exports = class ExifTransformer extends stream.Transform {
  constructor (options) {
    super(options)
    this.remainingBytes = null
    this.pending = []
  }

  _transform (chunk, encoding, callback) {
    let pendingChunk = Buffer.concat([...this.pending, chunk])
    if (pendingChunk.length === 0) return callback()
    if (this.remainingBytes === null) {
      var app1Start = pendingChunk.indexOf(app1Marker)
      if (app1Start === -1) {
        // if last byte is ff, wait for more
        if (pendingChunk[pendingChunk.length - 1] === app1Marker[0]) {
          this.pending.push(chunk)
          return callback()
        }
      } else {
        if (app1Start + 10 > pendingChunk.length) {
          this.pending.push(chunk)
          return callback()
        } else {
          const candidateMarker = pendingChunk.slice(app1Start + 4, app1Start + 10)
          if (candidateMarker.equals(exifMarker)) {
            this.remainingBytes = pendingChunk.readInt16BE(app1Start + 2) + 2
            this.push(pendingChunk.slice(0, app1Start))
            pendingChunk = pendingChunk.slice(app1Start)
          }
        }
      }
    }

    if (this.remainingBytes !== null) {
      if (pendingChunk.length >= this.remainingBytes) {
        this.push(pendingChunk.slice(this.remainingBytes))
        this.remainingBytes = null
      } else {
        this.remainingBytes -= pendingChunk.length
      }
    } else {
      this.push(pendingChunk)
    }
    this.pending.length = 0
    callback()
  }

  _final (callback) {
    if (this.pending.length) this.push(Buffer.concat(this.pending))
    callback()
  }
}
