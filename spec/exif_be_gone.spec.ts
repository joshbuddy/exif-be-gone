/* global it, describe */

const streamBuffers = require('stream-buffers')
const assert = require('chai').assert
const fs = require('fs')
const ExifBeGone = require('..')
const stream = require('stream')

describe('Exif be gone', () => {
  describe('stripping exif data', () => {
    it('should strip data', (done) => {
      const writer = new streamBuffers.WritableStreamBuffer()
      fs.createReadStream('Canon_40D.jpg').pipe(new ExifBeGone()).pipe(writer).on('finish', () => {
        assert.equal(writer.getContents().length, 5480)
        done()
      })
    })

    it('should still strip with partial chunks', (done) => {
      const writer = new streamBuffers.WritableStreamBuffer()
      const lengthBuf = Buffer.allocUnsafe(2)
      lengthBuf.writeInt16BE(8, 0)
      const readable = stream.Readable.from([
        Buffer.from('ff', 'hex'),
        Buffer.from('e1', 'hex'),
        lengthBuf,
        Buffer.from('457869', 'hex'),
        Buffer.from('660000', 'hex'),
        Buffer.from('0001020304050607', 'hex'),
        Buffer.from('08090a0b0c0d0e0f', 'hex'),
        Buffer.from('0001020304050607', 'hex'),
        Buffer.from('08090a0b0c0d0e0f', 'hex')
      ])
      readable.pipe(new ExifBeGone()).pipe(writer).on('finish', () => {
        const output = writer.getContents()
        assert.equal(output.length, 32)
        done()
      })
    })
  })
})
