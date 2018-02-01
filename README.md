# Exif be gone

Stream transformer to remove exif data

## Installation

Use `npm install exif-be-gone` to install this package.

## Example usage

```javascript
const ExifTransformer = require('exif-be-gone')

const reader = fs.createReadStream('Canon_40D.jpg')
const writer = fs.createWriteStream('out.jpg')

toStream(reader).pipe(new ExifTransformer()).pipe(writer)
```
