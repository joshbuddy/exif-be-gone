"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var app1Marker = Buffer.from('ffe1', 'hex');
var exifMarker = Buffer.from('457869660000', 'hex'); // Exif\0\0
var xmpMarker = Buffer.from('http://ns.adobe.com/xap', 'utf-8');
var flirMarker = Buffer.from('FLIR', 'utf-8');
var maxMarkerLength = Math.max(exifMarker.length, xmpMarker.length, flirMarker.length);
var ExifTransformer = /** @class */ (function (_super) {
    __extends(ExifTransformer, _super);
    function ExifTransformer(options) {
        var _this = _super.call(this, options) || this;
        _this.remainingBytes = undefined;
        _this.pending = [];
        return _this;
    }
    ExifTransformer.prototype._transform = function (chunk, encoding, callback) {
        this._scrub(false, chunk);
        callback();
    };
    ExifTransformer.prototype._final = function (callback) {
        while (this.pending.length !== 0) {
            this._scrub(true);
        }
        callback();
    };
    ExifTransformer.prototype._scrub = function (atEnd, chunk) {
        var pendingChunk = chunk ? Buffer.concat(__spreadArrays(this.pending, [chunk])) : Buffer.concat(this.pending);
        // currently haven't detected an app1 marker
        if (this.remainingBytes === undefined) {
            var app1Start = pendingChunk.indexOf(app1Marker);
            // no app1 in the current pendingChunk
            if (app1Start === -1) {
                // if last byte is ff, wait for more
                if (!atEnd && pendingChunk[pendingChunk.length - 1] === app1Marker[0]) {
                    if (chunk)
                        this.pending.push(chunk);
                    return;
                }
            }
            else {
                // there is an app1, but not enough data to read to exif marker
                // so defer
                if (app1Start + maxMarkerLength + 4 > pendingChunk.length) {
                    if (atEnd) {
                        this.push(pendingChunk);
                        this.pending.length = 0;
                    }
                    else if (chunk) {
                        this.pending.push(chunk);
                    }
                    return;
                    // we have enough, so lets read the length
                }
                else {
                    var candidateMarker = pendingChunk.slice(app1Start + 4, app1Start + maxMarkerLength + 4);
                    if (exifMarker.compare(candidateMarker, 0, exifMarker.length) === 0 || xmpMarker.compare(candidateMarker, 0, xmpMarker.length) === 0 || flirMarker.compare(candidateMarker, 0, flirMarker.length) === 0) {
                        // we add 2 to the remainingBytes to account for the app1 marker
                        this.remainingBytes = pendingChunk.readUInt16BE(app1Start + 2) + 2;
                        this.push(pendingChunk.slice(0, app1Start));
                        pendingChunk = pendingChunk.slice(app1Start);
                    }
                }
            }
        }
        // we have successfully read an app1/exif marker, so we can remove data
        if (this.remainingBytes !== undefined && this.remainingBytes !== 0) {
            // there is more data than we want to remove, so we only remove up to remainingBytes
            if (pendingChunk.length >= this.remainingBytes) {
                var remainingBuffer = pendingChunk.slice(this.remainingBytes);
                this.pending = remainingBuffer.length !== 0 ? [remainingBuffer] : [];
                this.remainingBytes = undefined;
                // this chunk is too large, remove everything
            }
            else {
                this.remainingBytes -= pendingChunk.length;
                this.pending.length = 0;
            }
        }
        else {
            // push this chunk
            this.push(pendingChunk);
            this.remainingBytes = undefined;
            this.pending.length = 0;
        }
    };
    return ExifTransformer;
}(stream_1.Transform));
exports.default = ExifTransformer;
module.exports = ExifTransformer;
