import 'package:path/path.dart' as path;
import 'dart:io' show Platform;

var _dirname = path.dirname(Platform.script.toFilePath());
final ssdir = path.normalize(path.join(_dirname, '..', '..', 'ss'));

const guiconfigfilename = 'gui-config.json';

var defaultguiconfig =  {
  'version': '4.1.10.0',
  'configs': [],
  'strategy': 'com.shadowsocks.strategy.ha',
  'index': -1,
  'global': false,
  'enabled': true,
  'shareOverLan': false,
  'isDefault': false,
  'isIPv6Enabled': false,
  'localPort': 1080,
  'portableMode': true,
  'showPluginOutput': true,
  'pacUrl': null,
  'gfwListUrl': null,
  'useOnlinePac': false,
  'secureLocalPac': true,
  'availabilityStatistics': false,
  'autoCheckUpdate': true,
  'checkPreRelease': false,
  'isVerboseLogging': true,
  'logViewer': {
    'topMost': false,
    'wrapText': false,
    'toolbarShown': false,
    'Font': 'Consolas, 8pt',
    'BackgroundColor': 'Black',
    'TextColor': 'White'
  },
  'proxy': {
    'useProxy': false,
    'proxyType': 0,
    'proxyServer': '',
    'proxyPort': 0,
    'proxyTimeout': 3,
    'useAuth': false,
    'authUser': '',
    'authPwd': ''
  },
  'hotkey': {
    'SwitchSystemProxy': '',
    'SwitchSystemProxyMode': '',
    'SwitchAllowLan': '',
    'ShowLogs': '',
    'ServerMoveUp': '',
    'ServerMoveDown': '',
    'RegHotkeysAtStartup': false
  }
};
