import { Plugins } from '@capacitor/core'

export const toast = (text: string) => {
  Plugins.Toast.show({
    text,
    position: 'bottom'
  });
}

export const copytext = (text: string) => {
  return Plugins.Clipboard.write({
    string: text
  })
}
