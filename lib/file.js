'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

//同步读写json的方法
function Json(path) {
  'use strict';

  var fs = require('fs');
  return {
    read: function read() {
      if (!has(path, 'file')) {
        throw new Error('function json, no json file');
      }
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    },
    write: function write(content) {
      if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && !!content) {
        content = JSON.stringify(content, null, 4);
      }
      fs.writeFileSync(path, content, 'utf8');
    }
  };
}

exports.has = has;
exports.Json = Json;