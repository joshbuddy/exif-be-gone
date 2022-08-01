"use strict";
/* global it, describe */
var streamBuffers = require('stream-buffers');
var assert = require('chai').assert;
var fs = require('fs');
var ExifBeGone = require('..');
var stream = require('stream');
describe('Exif be gone', function () {
    describe('stripping exif data', function () {
        it('should strip data', function (done) {
            var writer = new streamBuffers.WritableStreamBuffer();
            fs.createReadStream('Canon_40D.jpg').pipe(new ExifBeGone()).pipe(writer).on('finish', function () {
                assert.equal(writer.getContents().length, 5480);
                done();
            });
        });
        it('should still strip with partial chunks', function (done) {
            var writer = new streamBuffers.WritableStreamBuffer();
            var lengthBuf = Buffer.allocUnsafe(2);
            lengthBuf.writeInt16BE(8, 0);
            var readable = stream.Readable.from([
                Buffer.from('ff', 'hex'),
                Buffer.from('e1', 'hex'),
                lengthBuf,
                Buffer.from('457869', 'hex'),
                Buffer.from('660000', 'hex'),
                Buffer.from('0001020304050607', 'hex'),
                Buffer.from('08090a0b0c0d0e0f', 'hex'),
                Buffer.from('0001020304050607', 'hex'),
                Buffer.from('08090a0b0c0d0e0f', 'hex')
            ]);
            readable.pipe(new ExifBeGone()).pipe(writer).on('finish', function () {
                var output = writer.getContents();
                assert.equal(output.length, 32);
                done();
            });
        });
    });
});
