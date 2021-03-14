import { Logger } from "../main";
import { getAndroidPref, isAndroidAmbient, saveAndroidPref } from "./Utils";

export function setItem(key: string, value: any) {
  let stringValue = JSON.stringify(value);
  if (!isAndroidAmbient()) {
    localStorage.setItem(key, stringValue)
  } else {
    saveAndroidPref(key, stringValue)
  }
}

export function getTypedItem(Class: any, key: string) {
  let item = getItem(key) || {}
  return Object.assign(new Class(), item)
}

export function getItem<T>(key: string): T {
  try {
    let itemString = null;
    if (!isAndroidAmbient()) {
      itemString = localStorage.getItem(key);
    } else {
      itemString = getAndroidPref(key)
    }
    Logger.info("storage.getItem", itemString)
    if (itemString) {
      let json = JSON.parse(itemString) as T;
      return json;

    }
  } catch (e) {
    Logger.error(e);
    return null
  }
  return
}
