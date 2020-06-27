import 'dart:io' show Directory, Platform, Process, ProcessStartMode;
import 'package:path/path.dart' as path;
import 'consts.dart' show ssdir;

final osdigits = Platform.environment['ARCHITECTURE'];
/**
Usage: notifu [@argfile] [/?|h|help] [/v|version] [/t <value>] [/d ] [/p ]... [/m ]... [/i ] [/e] [/q] [/w] [/xp] [/c] [/k] [/l]

@argfile	Read arguments from a file.
/?		Show usage.
/v		Show version.
/t <value>	The type of message to display values are:
		   info         The message is an informational message
		   warn         The message is an warning message
		   error        The message is an error message
/d <value>	The number of milliseconds to display (omit or 0 for infinit)
/p <value>	The title (or prompt) of the ballon
/m <value>	The message text
/i <value>	Specify an icon to use ('parent' uses the icon of the parent process)
/e		Enable ballon tips in the registry (for this user only)
/q		Do not play a sound when the tooltip is displayed
/w		Show the tooltip even if the user is in the quiet period that follows his very first login (Windows 7 and up)
/xp		Force WindowsXP ballon tips behavior
/c		Constant (persistent) instance, will not be dismissed by new instances
/k		Removes every instance of Notifu, even the ones who are waiting to be displayed
/l		Diplay the license (BSD-3-Clause)
 */
void notify(String title, String message, [int timeout = 2500, String type = 'info']) {
  var cmd = path.join(ssdir, 'notifu${osdigits == '64' ? '64' : ''}.exe');
  Process.start(cmd, ['/t', type, '/d', timeout.toString(), '/p', title, '/m', message, '/q'], mode: ProcessStartMode.detached);
}

void main(List<String> args) {
  print(ssdir);
}
