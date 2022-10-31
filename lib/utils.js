const fs = require('fs');
const crypto = require('crypto');

function getMD5(filePath) {
    let str = fs.readFileSync(filePath, 'utf-8');
    let md5um = crypto.createHash('md5');
    md5um.update(str);
    return md5um.digest('hex');
}

module.exports = {
    getMD5
}