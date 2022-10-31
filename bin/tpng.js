#!/usr/bin/env node
const path = require('path');
const startCompressImage = require('../lib/compress-image');
const views = path.resolve(process.cwd(), 'src', 'views', 'index.js');
(async () => {
  try {
    const entrys = require(views);
    const arrEntrys = Object.keys(entrys);
    for (let i = 0; i < arrEntrys.length; i++) {
      const imgPath = path.resolve(process.cwd(), 'src', 'pages', arrEntrys[i]);
      await startCompressImage(imgPath);  
    }
  } catch (e) {
    startCompressImage(process.argv[2] || process.cwd());
  }
})();