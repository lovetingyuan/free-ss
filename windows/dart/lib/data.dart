import 'package:js/js.dart';

@JS()
external dynamic get nodeModuleExports;

final data = {
  'normal': {
    'url': 'https://3.weiwei.in/2020.html',
    'callback': (dynamic doc) {
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
  },
  'qrcode': {
    'url': 'https://io.freess.info/',
    'callback': (String htmlstr) {
      var exp = RegExp('"data:image.+?"', multiLine: true);
      var matches = exp.allMatches(htmlstr);
      List<String> list = [];
      matches.forEach((match) {
        list.add(htmlstr.substring(match.start + 1, match.end - 1));
      });
      return list;
    }
  }
};

void main () {
  nodeModuleExports(data);
}
