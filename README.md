# Exif be gone

Stream transformer to remove data that could be potentially private.

It currently looks for data in the app1 section that is either exif, xmp, or FLIR and removes it from the stream.

## Installation

Use `npm install exif-be-gone` to install this package.

## Example usage

```javascript
const ExifTransformer = require('exif-be-gone')
const fs = require("fs")

const reader = fs.createReadStream('Canon_40D.jpg')
const writer = fs.createWriteStream('out.jpg')

reader.pipe(new ExifTransformer()).pipe(writer)
```

There is also a command-line version that is installed that can be run via:

`$ exif-be-gone [INPUT] [OUTPUT]`
