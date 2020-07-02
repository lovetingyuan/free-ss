@JS('module')
library data;

import 'dart:html';

import 'package:js/js.dart';

@JS()
class AccountProvider {
  external set url(String url);
  external set type(String type);
  external set callback(Function callback);
}

@JS()
class Exports {
  external set data(List<AccountProvider> data);
}

@JS()
external Exports get exports;

@JS('exports.parseHtml')
external Document parseHtml(String htmlstr);

@JS()
class Account {
  external set server(String server);
  external set port(int port);
  external set password(String password);
  external set method(String method);
}

AccountProvider _getProvider (String url, String type, Function callback) {
  var item = AccountProvider();
  item.url = url;
  item.type = type;
  item.callback = callback;
  return item;
}

List<AccountProvider> data = [
  _getProvider('https://3.weiwei.in/2020.html', 'document', allowInterop((String htmlstr) {
    // if (doc.isEmpty) return [];
    List<Account> accounts = [];
    // var domparser = DomParser();
    var doc = parseHtml(htmlstr);
    doc.querySelectorAll('table tr').forEach((tr) {
      var tds = tr.querySelectorAll('td');
      if (tds.length < 4) return;
      var account = Account();
      var server = tds[0].text.trim();
      if (server.isEmpty) return;
      account.server = server;
      var port = tds[1].text.trim();
      if (port.isEmpty) return;
      account.port = int.parse(port);
      var method = tds[2].text.trim();
      if (method.isEmpty) return;
      account.method = method;
      var password = tds[3].text.trim();
      if (password.isEmpty) return;
      account.password = password;
      accounts.add(account);
    });
    return accounts;
  })),
  _getProvider('https://io.freess.info', 'qrcode', allowInterop((String htmlstr) {
    var exp = RegExp('"data:image.+?"', multiLine: true);
    var matches = exp.allMatches(htmlstr);
    List<String> list = [];
    matches.forEach((match) {
      list.add(htmlstr.substring(match.start + 1, match.end - 1));
    });
    return list;
  }))
];

void main() {
  exports.data = data;
}
