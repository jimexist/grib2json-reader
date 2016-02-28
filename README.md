# Grib2 Json File Reader

- Code from [Earth project](https://github.com/cambecc/earth).
- See also [Grib2json project](https://github.com/cambecc/grib2json)

## Example Usage

```javascript
import reader from 'grib2json-reader';
import data from './gfs.json';

console.log('field value is', reader(data).field(20, 20));
```

