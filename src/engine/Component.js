/**
 * Represents the Component in the Entity Component System.
 * Basically this class doesn't do anything - It's just a empty class.
 * @constructor
 */
function Component() {
  // Empty
}

Component.create = function(options) {
  return new Component();
}

Package.Component = Component;
