
/**
 * 
 * localStorage的获取和设置
 */
export function setStorage(key,value) {
    localStorage.setItem(key, value);
}
export function getStorage(key) {
  let this_value = localStorage.getItem(key);
  return this_value;
}