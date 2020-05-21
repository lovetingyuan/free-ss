package foo.bar.ssaccount;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginMethod;
import android.content.Intent;
import android.content.Context;
import android.widget.Toast;

import org.json.JSONException;

@NativePlugin()
public class CustomNativePlugin extends Plugin {

  @PluginMethod()
  public void startSS(PluginCall call) throws JSONException {
    // More code here...
    this.startNewActivity(this.getContext(), "com.github.shadowsocks");
    call.success(new JSObject("{done: true}"));
  }

  public void startNewActivity(Context context, String packageName) {
    Intent intent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    if (intent != null) {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(intent);
    } else {
      CharSequence text = "没找到ss客户端";
      int duration = Toast.LENGTH_SHORT;

      Toast toast = Toast.makeText(context, text, duration);
      toast.show();
    }
  }
}
