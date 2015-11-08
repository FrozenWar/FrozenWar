import * as defaultTemplate from './template.json';

export function deepCopy(src, dest) {
  for (var i in src) {
    if (typeof src[i] == 'object' && !Array.isArray(src[i])) {
      if (dest[i] == null) dest[i] = {};
      deepCopy(src[i], dest[i]);
    } else {
      dest[i] = src[i];
    }
  }
  return dest;
}

export default function getTemplate(key, template = defaultTemplate) {
  var origin = template[key];
  if (origin == null) return {};
  var obj = {};
  if (origin['prototype']) {
    var protoObj = getTemplate(origin['prototype'], template);
    deepCopy(protoObj, obj);
  }
  deepCopy(origin, obj);
  delete obj['prototype'];
  return obj;
}
