import 'dart:convert';

import 'package:path/path.dart' as path;
import 'dart:io' show File, Platform;

var _dirname = path.dirname(Platform.script.toFilePath());
final ssdir = path.normalize(path.join(_dirname, '..', '..', 'ss'));

const guiconfigfilename = 'gui-config.json';

var _file = File(path.join(ssdir, '_gui-config.default.json'));

var defaultguiconfig = json.decode(_file.readAsStringSync());
