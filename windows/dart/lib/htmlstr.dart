import 'package:html/parser.dart';
import 'package:html/dom.dart';

import 'request.dart';

List<Map<String, Object>> _documentcallback(Document doc) {
  List<Map<String, Object>> accounts = [];
  doc.querySelectorAll('table tr').forEach((tr) {
    var tds = tr.querySelectorAll('td');
    if (tds.length < 4) return;
    Map<String, Object> account = {};
    var order = ['server', 'port', 'method', 'password'];
    for (var i = 0; i < 4; i++) {
      var val = tds[i].text.trim();
      if (val.isEmpty) {
        return;
      }
      account[order[i]] = i == 1 ? int.parse(val) : val;
    }
    accounts.add(account);
  });
  return accounts;
}

Future<List<Map<String, Object>>> getaccountsbyhtmlstr() async {
  var htmlstr = await request('https://3.weiwei.in/2020.html');
  if (htmlstr.isNotEmpty) {
    var document = parse(htmlstr);
    var accounts = _documentcallback(document);
    return accounts;
  }
  return [];
}
