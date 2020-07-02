import 'dart:io';

class Item {
  String url;
  Function callback;
  Item (this.url, this.callback);
}

void main () {
  var a = Item('sdfsdf', () {
    return 'sdfsdjkf';
  });
  print(a.url);
  var aa = a.callback;
  
  print(aa());
  // print(a.callback());
}
