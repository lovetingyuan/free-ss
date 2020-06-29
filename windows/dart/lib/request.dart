import 'package:http/http.dart' as http;

Future<String> request(String url) async {
  var client = http.Client();
  final response = await client.get(Uri.parse(url));
  client.close();
  if (response.statusCode == 200) {
    return response.body;
  }
  return '';
}
