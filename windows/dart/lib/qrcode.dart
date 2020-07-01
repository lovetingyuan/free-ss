import 'dart:convert' show utf8, base64Decode;
import 'request.dart';

List<String> _base64callback(String htmlstr) {
  var exp = RegExp('"data:image.+?"', multiLine: true);
  var matches = exp.allMatches(htmlstr);
  List<String> list = [];
  matches.forEach((match) {
    list.add(htmlstr.substring(match.start + 1, match.end - 1));
  });
  return list;
}

Future<String> _parseqrcode(String base64str) async {
  var htmlstr = await request('https://zxing.org/w/decode?u=' + Uri.encodeQueryComponent(base64str));
  var exp = RegExp('ss://.+?<', multiLine: true);
  if (exp.hasMatch(htmlstr)) {
    var match = exp.firstMatch(htmlstr);
    return htmlstr.substring(match.start, match.end - 1);
  }
  return '';
}

Future<List<Map<String, Object>>> getaccountsbyqrcode() async {
  const url = 'https://io.freess.info/';
  final htmlstr = await request(url);
  if (htmlstr.isEmpty) {
    return [];
  }
  var base64list = _base64callback(htmlstr);
  var accounts = base64list.map((element) async {
    var ssurl = await _parseqrcode(element);
    if (ssurl.isEmpty) {
      return null;
    }
    var base64 = ssurl.substring('ss://'.length);
    var parsedstr = utf8.decode(base64Decode(base64)).trim();
    var parsedlist = parsedstr.split(RegExp('@|:'));
    if (parsedlist.every((element) => element.isNotEmpty)) {
      return {
        'server': parsedlist[2],
        'port': int.parse(parsedlist[3]),
        'password': parsedlist[1],
        'method': parsedlist[0]
      };
    }
    return null;
  }).toList();
  return Future.wait(accounts).then((list) {
    return list.where((element) => element != null).toList();
  });
}

