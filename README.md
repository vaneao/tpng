## Operating environment
- Mac OS
- Node.js - v10.17.0
- npm - v6.11.3

## Usage

```js
% npm install tpng
```
Then find a folder directory with pictures, such as folder A, and then execute 'tpng' in the A directory, which can compress all the pictures in this folder (including the pictures in the folder under A will also be compressed) .

```js
% ~/A tpng
```
You can find a file named tiny.json in the A directory. When you execute tpng again, it will first detect the compressed images in tiny.json to prevent repeated compression. If you want to recompress, delete tiny.json.
