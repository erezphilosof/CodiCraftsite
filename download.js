const https = require('https');
const fs = require('fs');

https.get('https://brainit.es/assets/js/shapes.js', (res) => {
    res.pipe(fs.createWriteStream('website/assets/js/shapes.js'));
});
