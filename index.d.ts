/// <reference types="node" />
/// <reference types="node" />
import { Transform, type TransformOptions, type TransformCallback } from 'stream';
declare class ExifTransformer extends Transform {
    remainingScrubBytes: number | undefined;
    remainingGoodBytes: number | undefined;
    pending: Array<Buffer>;
    mode: 'png' | 'webp' | 'other' | undefined;
    constructor(options?: TransformOptions);
    _transform(chunk: any, _: BufferEncoding, callback: TransformCallback): void;
    _final(callback: TransformCallback): void;
    _scrub(atEnd: Boolean, chunk?: Buffer): void;
    _scrubOther(atEnd: Boolean, chunk?: Buffer): void;
    _scrubPNG(atEnd: Boolean, chunk?: Buffer): void;
    _processPNGGood(chunk: Buffer): Buffer;
    _scrubWEBP(atEnd: Boolean, chunk?: Buffer): void;
}
export default ExifTransformer;
//# sourceMappingURL=index.d.ts.map