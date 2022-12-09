import { Transform, TransformOptions, TransformCallback } from 'stream'

const app1Marker = Buffer.from('ffe1', 'hex')
const exifMarker = Buffer.from('457869660000', 'hex') // Exif\0\0
const xmpMarker = Buffer.from('http://ns.adobe.com/xap', 'utf-8')
const flirMarker = Buffer.from('FLIR', 'utf-8')

const maxMarkerLength = Math.max(exifMarker.length, xmpMarker.length, flirMarker.length)

class ExifTransformer extends Transform {
  remainingBytes: number | undefined
  pending: Array<Buffer>

  constructor (options?: TransformOptions) {
    super(options)
    this.remainingBytes = undefined
    this.pending = []
  }

  override _transform (chunk: any, _: string, callback: TransformCallback) {
    this._scrub(false, chunk)
    callback()
  }

  override _final (callback: TransformCallback) {
    while (this.pending.length !== 0) {
      this._scrub(true)
    }
    callback()
  }

  _scrub (atEnd: Boolean, chunk?: Buffer) {
    let pendingChunk = chunk ? Buffer.concat([...this.pending, chunk]) : Buffer.concat(this.pending)
    // currently haven't detected an app1 marker
    if (this.remainingBytes === undefined) {
      const app1Start = pendingChunk.indexOf(app1Marker)
      // no app1 in the current pendingChunk
      if (app1Start === -1) {
        // if last byte is ff, wait for more
        if (!atEnd && pendingChunk[pendingChunk.length - 1] === app1Marker[0]) {
          if (chunk) this.pending.push(chunk)
          return
        }
      } else {
        // there is an app1, but not enough data to read to exif marker
        // so defer
        if (app1Start + maxMarkerLength + 4 > pendingChunk.length) {
          if (atEnd) {
            this.push(pendingChunk)
            this.pending.length = 0
          } else if (chunk) {
            this.pending.push(chunk)
          }
          return
        // we have enough, so lets read the length
        } else {
          const candidateMarker = pendingChunk.slice(app1Start + 4, app1Start + maxMarkerLength + 4)
          if (exifMarker.compare(candidateMarker, 0, exifMarker.length) === 0 || xmpMarker.compare(candidateMarker, 0, xmpMarker.length) === 0 || flirMarker.compare(candidateMarker, 0, flirMarker.length) === 0) {
            // we add 2 to the remainingBytes to account for the app1 marker
            this.remainingBytes = pendingChunk.readUInt16BE(app1Start + 2) + 2
            this.push(pendingChunk.slice(0, app1Start))
            pendingChunk = pendingChunk.slice(app1Start)
          }
        }
      }
    }

    // we have successfully read an app1/exif marker, so we can remove data
    if (this.remainingBytes !== undefined && this.remainingBytes !== 0) {
      // there is more data than we want to remove, so we only remove up to remainingBytes
      if (pendingChunk.length >= this.remainingBytes) {
        const remainingBuffer = pendingChunk.slice(this.remainingBytes)
        this.pending = remainingBuffer.length !== 0 ? [remainingBuffer] : []
        this.remainingBytes = undefined
      // this chunk is too large, remove everything
      } else {
        this.remainingBytes -= pendingChunk.length
        this.pending.length = 0
      }
    } else {
      // push this chunk
      this.push(pendingChunk)
      this.remainingBytes = undefined
      this.pending.length = 0
    }
  }
}

export default ExifTransformer
module.exports = ExifTransformer
