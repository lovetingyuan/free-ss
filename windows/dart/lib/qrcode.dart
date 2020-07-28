import 'dart:convert' show base64Decode, jsonDecode, jsonEncode, utf8;
import 'request.dart';
import 'package:html/parser.dart';
import 'consts.dart';

List<String> _base64callback(String htmlstr) {
  var exp = RegExp('"data:image.+?"', multiLine: true);
  var matches = exp.allMatches(htmlstr);
  List<String> list = [];
  matches.forEach((match) {
    list.add(htmlstr.substring(match.start + 1, match.end - 1));
  });
  return list;
}

Future<String> _parseqrcode(String uri) async {
  const qrcodeapi = 'https://zxing.org/w/decode?u=';
  try {
     var htmlstr = await request(qrcodeapi + Uri.encodeQueryComponent(uri));
    var exp = RegExp('ss://.+?<', multiLine: true);
    if (exp.hasMatch(htmlstr)) {
      var match = exp.firstMatch(htmlstr);
      return htmlstr.substring(match.start, match.end - 1);
    }
  } catch (__) {
    const qrcodeapi2 = 'http://api.qrserver.com/v1/read-qr-code/?fileurl=';
    var htmlstr = await request(qrcodeapi2 + Uri.encodeQueryComponent(uri));
    htmlstr = htmlstr.trim();
    try {
      var body = jsonDecode(htmlstr);
      if (body[0]['symbol'][0]['error'] == null) {
        return body[0]['symbol'][0]['data'];
      }
    } catch (e) {
      return '';
    }
  }
  return '';
}

Account _parsessprotocol(String ssurl) {
  if (!ssurl.startsWith('ss://')) return null;
  var base64 = ssurl.substring('ss://'.length);
  var parsedstr = utf8.decode(base64Decode(base64)).trim();
  var parsedlist = parsedstr.split(RegExp('@|:'));
  if (parsedlist.every((element) => element.isNotEmpty)) {
    if (parsedlist[1].contains('\n')) return null;
    try {
      int.parse(parsedlist[3]);
    } catch (__) {
      return null;
    }
    return Account(parsedlist[2], parsedlist[3], parsedlist[1], parsedlist[0]);
  }
}

Future<List<Account>> getaccountsbyurlqrcode() async {
  const url = 'https://my.freeshadowsocks.org/';
  var htmlstr = await request(url);
  if (htmlstr.isEmpty) return [];
  var doc = parse(htmlstr);
  var results = doc.querySelectorAll('.ss a[href\$=".png"]').map((a) async {
    var href = a.attributes['href'];
    if (!href.startsWith('http')) {
      href = url + (href[0] == '/' ? href.substring(1) : href);
    }
    return _parsessprotocol(await _parseqrcode(href));
  }).toList();
  return Future.wait(results).then((value) {
    return value.where((element) => element != null).toList();
  });
}

Future<List<Account>> getaccountsbybase64qrcode() async {
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
    return _parsessprotocol(ssurl);
  }).toList();
  return Future.wait(accounts).then((list) {
    return list.where((element) => element != null).toList();
  });
}
