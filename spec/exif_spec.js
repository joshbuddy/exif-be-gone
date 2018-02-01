/* global it, describe */

var streamBuffers = require('stream-buffers')
const assert = require('chai').assert
const fs = require('fs')
const ExifBeGone = require('..')

describe('Exif be gone', () => {
  describe('stripping exif data', () => {
    it('should strip data', (done) => {
      const writer = new streamBuffers.WritableStreamBuffer()
      fs.createReadStream('Canon_40D.jpg').pipe(new ExifBeGone()).pipe(writer).on('finish', () => {
        assert.equal(writer.getContents().length, 5481)
        done()
      })
    })
  })
})
