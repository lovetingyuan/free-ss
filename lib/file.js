/**
 * 判断有没有那个目录或文件
 * @param  {string}  filepath 文件或文件夹的路径
 * @param  {string}  mode     可取'file'或者'dir'，指定类型，可以为空，此时代表文件或目录均可
 * @return {Boolean}          true代表存在，否则代表不存在
 */
function has(filepath, mode) {
    var stat, fs = require('fs');
    if (mode === 'file') {
        try {
            stat = fs.statSync(filepath);
            return stat.isFile();
        } catch (e) {
            return false;
        }
    } else if (mode === 'dir') {
        try {
            stat = fs.statSync(filepath);
            return stat.isDirectory();
        } catch (e) {
            return false;
        }
    } else {
        try {
            fs.statSync(filepath);
            return true;
        } catch (e) {
            return false;
        }
    }
}

//同步读写json的方法
function ReadWriteJson() {
    var fs = require('fs');
    function read(jsonPath) {
        var jsonStr;
        var result;
        if (has(jsonPath, 'file')) {
            jsonStr = fs.readFileSync(jsonPath, 'utf8');
            try {
                result = JSON.parse(jsonStr);
                return result;
            } catch (e) {
                console.log("fail to parse json file..." + jsonPath);
                return null;
            }
        } else {
            console.log("json file:" + jsonPath + "doesn't exist...");
            return null;
        }
    }

    function write(path, content) {
        if (typeof content === 'object') {
            try {
                content = JSON.stringify(content, null, 4);
                fs.writeFileSync(path, content, 'utf8');
            } catch (e) {
                console.log("invalid json object: " + e.toString());
                return false;
            }
        } else if (typeof content === 'string') {
            fs.writeFileSync(path, content, 'utf8');
        } else {
            return false;
        }
        return true;
    }
    return {
        read: read,
        write: write
    };
}


function buildDir(path) {
    var fs = require('fs');
    if (!has(path, 'dir')) {
        fs.mkdirSync(path);
    }
}

exports.has = has;
exports.ReadWriteJson = ReadWriteJson;
exports.buildDir = buildDir;
