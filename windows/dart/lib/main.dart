import 'htmlstr.dart';
import 'qrcode.dart';
import 'dart:io' show Platform, sleep;
import 'notify.dart';
import 'startss.dart';
import 'writeaccounts.dart';

void main(List<String> arguments) async {
  if (!Platform.isWindows) {
    print('只支持windows系统.');
    return;
  }
  print('正在启动，请稍候...');
  List<Map<String, Object>> allaccounts = [];
  try {
    var accounts = await Future.wait([
      getaccountsbyqrcode(),
      getaccountsbyhtmlstr()
    ]);
    allaccounts = accounts[0] + accounts[1];
  } catch (__) {}
  if (allaccounts.isEmpty) {
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
