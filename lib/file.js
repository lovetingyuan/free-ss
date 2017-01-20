'use strict';

/**
 * 判断有没有那个目录或文件
 * @param  {string}  filepath 文件或文件夹的路径
 * @param  {string}  mode     可取'file'或者'dir'，指定类型，可以为空，此时代表文件或目录均可
 * @return {Boolean}          true代表存在，否则代表不存在
 */
function has(filepath, mode) {
  'use strict';

  var stat,
      fs = require('fs');
  try {
    stat = fs.statSync(filepath);
    if (mode) {
      if (mode === 'file' && stat.isFile()) return true;else if (mode === 'dir' && stat.isDirectory()) return true;else return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function getSHA(filePath) {
  if (!has(filePath, 'file')) return null;
  var crypto = require('crypto'),
      fs = require('fs');
  var result = crypto.createHash('sha1').update(fs.readFileSync(filePath), 'utf8').digest('hex');
  return result.toLowerCase();
}

exports.has = has;
exports.getSHA = getSHA;