import 'dart:convert' show jsonEncode, jsonDecode;
import 'dart:io' show File;
import 'package:path/path.dart' as path;
import 'consts.dart';

Object _genaccountsconfig (account) {
  return {
    'server': account.server,
    'server_port': account.port,
    'password': account.password,
    'method': account.method,
    'plugin': '',
    'plugin_opts': '',
    'plugin_args': '',
    'remarks': '',
    'timeout': 10
  };
}

void writeaccounts (List<Account> accounts) {
  var guiconfigpath = path.join(ssdir, guiconfigfilename);
  var guiconfigfile = File(guiconfigpath);
  var guiconfig = defaultguiconfig;
  if (guiconfigfile.existsSync()) {
    guiconfig = jsonDecode(guiconfigfile.readAsStringSync());
  } else {
    guiconfigfile.createSync();
  }
  guiconfig['configs'] = accounts.map((account) {
    return _genaccountsconfig(account);
  }).toList();
  guiconfigfile.writeAsStringSync(jsonEncode(guiconfig));
}
