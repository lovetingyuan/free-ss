library ssaccounts;

import 'dart:convert';

import 'htmlstr.dart';
import 'qrcode.dart';
import 'dart:io' show Directory, File, Platform, sleep;
import 'package:path/path.dart' as path;
import 'notify.dart';
import 'startss.dart';
import 'writeaccounts.dart';
import 'consts.dart';

void main(List<String> arguments) async {
  if (!Platform.isWindows) {
    print('只支持windows系统.');
    return;
  }
  print('正在启动，请稍候...');
  List<Account> allaccounts = [];
  try {
    var accounts = await Future.wait([
      getaccountsbybase64qrcode(),
      getaccountsbyurlqrcode(),
      getaccountsbyhtmlstr()
    ]);
    allaccounts = accounts.reduce((value, element) {
      return value + element;
    });
  } catch (__) {}
  if (arguments.isNotEmpty && arguments[0] == '-o') {
    if (allaccounts.isNotEmpty) {
      var current = Directory.current;
      var file = File(path.join(current.path, 'ssaccounts.json'));
      file.writeAsStringSync(jsonEncode(allaccounts));
      print('Done, accounts saved to ${file.path}');
    } else {
      print('No available accounts for now.');
    }
  } else {
    if (allaccounts.isEmpty) {
      print('No available accounts for now.');
      notify('失败', '暂无可用账号.');
      sleep(Duration(seconds: 3));
    } else {
      writeaccounts(allaccounts);
      startss();
      notify('成功: ${allaccounts.length}', '现在可以访问Google.');
      print('完成，可以访问：https://google.com');
      sleep(Duration(seconds: 1));
    }
  }
}
