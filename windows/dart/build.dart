import 'package:path/path.dart' as path;
import 'dart:io' show Platform;
import 'package:process_run/process_run.dart';

var _dirname = path.dirname(Platform.script.toFilePath());

void main() async {
  print(_dirname);
  await run('dart2native bin/ssaccounts.dart', [], verbose: true, workingDirectory: _dirname);
  // await run('rcedit-x64.exe bin/ssaccounts.exe --set-icon airnet.ico', [], verbose: true, workingDirectory: _dirname, runInShell: true);
  print('build done!');
}
