import { Transform, TransformOptions, TransformCallback } from "stream"

const app1Marker = Buffer.from('ffe1', 'hex')
const exifMarker = Buffer.from('457869660000', 'hex') // Exif\0\0

class ExifTransformer extends Transform {
  remainingBytes?: number
  pending: Array<Buffer>
  app1Detected: boolean

  constructor (options?: TransformOptions) {
    super(options)
    this.remainingBytes = undefined
    this.pending = []
    this.app1Detected = false
  }

  _transform (chunk: any, encoding: string, callback: TransformCallback) {
    let pendingChunk = Buffer.concat([...this.pending, chunk])
    if (pendingChunk.length === 0) return callback()

    // currently haven't detected an app1 marker
    if (!this.app1Detected && this.remainingBytes === undefined) {
      var app1Start = pendingChunk.indexOf(app1Marker)
      // no app1 in the current pendingChunk
      if (app1Start === -1) {
        // if last byte is ff, wait for more
        if (pendingChunk[pendingChunk.length - 1] === app1Marker[0]) {
          this.pending.push(chunk)
          return callback()
        }
      } else {
        // there is an app1, but not enough data to read to exif marker
        // so defer
        if (app1Start + 10 > pendingChunk.length) {
          this.pending.push(chunk)
          return callback()
        // we have enough, so lets read the length
        } else {
          const candidateMarker = pendingChunk.slice(app1Start + 4, app1Start + 10)
          if (candidateMarker.equals(exifMarker)) {
            // we add 2 to the remainingBytes to account for the app1 marker
            this.remainingBytes = pendingChunk.readInt16BE(app1Start + 2) + 2
            this.push(pendingChunk.slice(0, app1Start))
            pendingChunk = pendingChunk.slice(app1Start)
            this.app1Detected = true
          }
        }
      }
    }

    // we have successfully read an app1/exif marker, so we can remove data
    if (this.remainingBytes !== undefined) {
      // there is more data than we want to remove, so we only remove up to remainingBytes
      if (pendingChunk.length >= this.remainingBytes) {
        this.push(pendingChunk.slice(this.remainingBytes))
        this.remainingBytes = undefined
      // this chunk is too large, remove everything
      } else {
        this.remainingBytes -= pendingChunk.length
      }
    } else {
      // push this chunk
      this.push(pendingChunk)
    }

    // if we've gotten to this point, we need to clear out pending
    // and call the callback
    this.pending.length = 0
    callback()
  }

  _final (callback: TransformCallback) {
    if (this.pending.length) this.push(Buffer.concat(this.pending))
    callback()
  }
}

export = ExifTransformer