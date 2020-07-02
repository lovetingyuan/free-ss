import 'package:html/parser.dart';
import 'consts.dart';

import 'request.dart';

Future<List<Account>> getaccountsbyhtmlstr() async {
  var htmlstr = await request('https://3.weiwei.in/2020.html');
  List<Account> accounts = [];
  if (htmlstr.isEmpty) return accounts;
  var doc = parse(htmlstr);
  doc.querySelectorAll('table tr').forEach((tr) {
    var tds = tr.querySelectorAll('td');
    if (tds.length < 4) return;
    var server = tds[0].text.trim();
    if (server.isEmpty) return;
    var port = tds[1].text.trim();
    if (port.isEmpty) return;
    var method = tds[2].text.trim();
    if (method.isEmpty) return;
    var password = tds[3].text.trim();
    if (password.isEmpty) return;
    accounts.add(Account(server, port, password, method));
  });
  return accounts;
}
