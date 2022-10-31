const fs = require('fs');
const path = require('path');
const https = require('https');
const jsonfile = require('jsonfile');
const { URL } = require('url');
const utils = require('./utils');

const options = {
  method: 'POST',
  hostname: 'tinypng.com',
  path: '/web/shrink',
  headers: {
    rejectUnauthorized: false,
    'Postman-Token': Date.now(),
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
  }
};
const exts = ['.jpg', '.png'];
const max = 5200000; // 5MB == 5242848.754299136
/** 压缩记录 */
let compressRecord = {};

 /**
  * 生成随机IP， 赋值给 X-Forwarded-For
  */
function getRandomIP() {
  return Array.from(Array(4)).map(() => parseInt(Math.random() * 255)).join('.')
}

/**
 * 文件上传
 */
const fileUpload = img => new Promise((resolve, reject) => {
  options.headers['X-Forwarded-For'] = getRandomIP();
  const req = https.request(options, res => {
    res.on('data', buf => {
      let obj = JSON.parse(buf.toString());
      if (obj.error) {
        console.log(`💥 ${img}：压缩失败！错误：${obj.message}`);
      } else {
        resolve(obj);
      }
    });
  });
  req.write(fs.readFileSync(img), 'binary');
  req.on('error', e => {
    console.error(e);
    reject(e);
  });
  req.end();
});

/**
 * 文件下载
 */
const downloadFile = (data, imgpath) => new Promise((resolve, reject) => {
  let options = new URL(data.output.url);
  let req = https.request(options, res => {
    let body = '';
    res.setEncoding('binary');
    res.on('data', function(data) {
      body += data;
    });
    res.on('end', function() {
      fs.writeFile(imgpath, body, 'binary', err => {
        if (err) return console.error(err);
        console.log(`🎉 [${imgpath}] 图片压缩成功，原始大小:${data.input.size}，压缩大小:${ data.output.size}，优化比例:${data.output.ratio} `);
        resolve(res);
      });
    });
  });
  req.on('error', e => {
    console.error(e);
    reject(e);
  });
  req.end();
});

/**
 * 压缩文件
 */
async function compressImage(folder, compressRecordPath) {
  const arrFiles = fs.readdirSync(folder);
  for (let i = 0; i < arrFiles.length; i++) {
    const file = arrFiles[i];
    const filePath = path.resolve(folder, file);
    const stat = fs.statSync(filePath);
    // 必须是文件，小于5MB，后缀 jpg||png
    if (stat.isFile() && stat.size <= max && exts.includes(path.extname(filePath))) {
      if (compressRecord[compressRecordPath][utils.getMD5(filePath)]) continue; // 已经压缩过了
      // 上传文件
      fileUpload(filePath).then(async data => {
        // 下载文件
        await downloadFile(data, filePath);
        compressRecord[compressRecordPath][utils.getMD5(filePath)] = {
          url: data.output.url,
          local: filePath.replace(compressRecordPath, '')
        };
        const tinyJsonPath = path.join(compressRecordPath, 'tiny.json');
        jsonfile.writeFileSync(tinyJsonPath, compressRecord[compressRecordPath], { spaces: 2, EOL: '\r\n' });
      });
    } else if (stat.isDirectory()) {
      await compressImage(filePath, compressRecordPath);
    }
  }
}

/**
 * 启动图片压缩
 */
module.exports = async function startCompressImage(imagePath) {
  console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 准备开始压缩图片，请耐心等待 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀');
  try {
    const tinyRecord = require(path.join(imagePath, 'tiny.json'));
    compressRecord[imagePath] = tinyRecord;
  } catch (e) {
    compressRecord[imagePath] = {};
  }
  await compressImage(imagePath, imagePath);
}