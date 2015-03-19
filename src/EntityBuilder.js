var EntityBuilder = {};

function deepCopy(src, dest) {
  for(var i in src) {
    if(typeof src[i] == 'object' && !Array.isArray(src[i])) {
      if(dest[i] == null) dest[i] = {};
      deepCopy(src[i], dest[i]);
    } else {
      dest[i] = src[i];
    }
  }
  return dest;
}

EntityBuilder.getEntityTemplate = function(template) {
  var origin = Package.EntityTemplate[template];
  if(origin == null) return {};
  var obj = {};
  if(origin['prototype']) {
    var protoObj = EntityBuilder.getEntityTemplate(origin['prototype']);
    deepCopy(protoObj, obj);
  }
  deepCopy(origin, obj);
  delete obj['prototype'];
  return obj;
}

EntityBuilder.buildEntity = function(engine, template) {
  var entity = new Package.Entity(engine);
  for(var key in template) {
    if(Package.components[key]) {
      if(typeof Package.components[key].create == 'function') {
        entity.add(Package.components[key].create(template[key]));
      } else {
        throw new Error('Component '+key+' does not have create function');
      }
    } else {
      throw new Error('Component '+key+' not found');
    }
  }
  return entity;
}

Package.EntityBuilder = EntityBuilder;
