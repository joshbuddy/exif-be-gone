/// <reference types="node" />
/// <reference types="node" />
import { Transform, TransformOptions, TransformCallback } from 'stream';
declare class ExifTransformer extends Transform {
    remainingBytes: number | undefined;
    pending: Array<Buffer>;
    constructor(options?: TransformOptions);
    _transform(chunk: any, _: string, callback: TransformCallback): void;
    _final(callback: TransformCallback): void;
    _scrub(atEnd: Boolean, chunk?: Buffer): void;
}
export default ExifTransformer;
//# sourceMappingURL=index.d.ts.map