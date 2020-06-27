import 'dart:io';
import 'package:path/path.dart' as path;

void main () {
  var current = Directory.current.absolute.path;
  var filepath = Platform.script.path;
  print(filepath);
  print(current);
  var a = path.normalize(Platform.script.toFilePath());
  print(a);
}
