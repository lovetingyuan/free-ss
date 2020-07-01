import 'dart:io' show Directory, Process, ProcessStartMode;
import 'package:path/path.dart' as path;
import 'notify.dart';
import 'consts.dart' show ssdir;

void startss () {
  var ssfilename = '';
  var ssfilepath = '';
  Directory(ssdir).listSync().forEach((element) {
    var filename = path.basename(element.path);
    if (filename.startsWith('Shadowsocks') && filename.endsWith('.exe')) {
      ssfilename = filename;
      ssfilepath = path.join(ssdir, filename);
    }
  });
  if (ssfilename.isEmpty) {
    notify('错误', '在"${ssdir}"未找到shadowsock.exe客户端程序', 4000, 'error');
    return;
  }
  var pret = Process.runSync('tasklist', [
    '/FI', 'IMAGENAME eq ${ssfilename}', '/FO', 'csv', '/NH'
  ]);
  var ps = (pret.stdout as String).trim().split('\r\n');
  if (ps.isNotEmpty && ps[0].isNotEmpty && ps[0].contains(ssfilename)) {
    var pid = ps[0].split(',').map((v) => v.trim()).toList()[1];
    if (pid.isNotEmpty) {
      pid = pid.substring(1, pid.length - 1);
      Process.killPid(int.parse(pid));
    }
  }
  Process.start(ssfilepath, [], mode: ProcessStartMode.detached);
}
