### 使用 [`nodejs`](https://nodejs.org/en/) 配合 [`shadowsocks-windows`](https://github.com/shadowsocks/shadowsocks-windows) 实现翻墙 （windows）

[![Version](https://img.shields.io/npm/v/freess.svg "version")](https://www.npmjs.com/package/freess)
[![depend](https://david-dm.org/lovetingyuan/freess/status.svg "dependencies")](https://david-dm.org/lovetingyuan/freess)

**使用方法：**
* 如果你没有安装`nodejs`请先安装，访问 https://nodejs.org/en/ 下载安装最新版即可
* 首次使用需要在命令行中执行 `npm install -g --production freess`
* 命令行中执行 `ss` 命令即可翻墙（首次使用需要耐心等待）
* 如果发生错误或者不能正常使用，请尝试通过命令`npm install -g freess`进行升级

**:heavy_exclamation_mark: 注意：**
+ 使用时不要关闭命令行界面；
+ 如果不成功，请在 ![小飞机](https://raw.githubusercontent.com/shadowsocks/shadowsocks-windows/master/shadowsocks-csharp/Resources/ss16.png) 图标右击选择其他服务器；
+ 退出时请在任务栏的 ![小飞机](https://raw.githubusercontent.com/shadowsocks/shadowsocks-windows/master/shadowsocks-csharp/Resources/ss16.png) 图标右击点击退出，否则请手动还原系统的代理设置

也可以尝试更新hosts文件的方式，请戳https://github.com/lovetingyuan/hosit
