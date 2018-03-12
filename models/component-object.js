const slug = require('slug');
const decamelize = require('decamelize');

/**
 * Class to represent Component model
 */
class ComponentObject {
  /**
   * @constructor
   *
   * @param {Object} data Restored from the data store model.
   * @param {Object} key Datastore key.
   */
  constructor(data, key) {
    this.name = data.name;
    this.ref = data.ref;
    this.group = data.group;
    this.groupRef = slug(decamelize(data.group, '-'));
    this.version = data.version;
    this.versions = data.versions;
    this.key = key;
  }
  /**
   * Prepares data for serialization.
   *
   * @return {Object} Data to be serialized
   */
  toJSON() {
    return {
      name: this.name,
      ref: this.ref,
      group: this.group,
      version: this.version,
      versions: this.generateVersions(),
      id: this.generateId()
    };
  }
  /**
   * Generates id of the group.
   *
   * @return {String} Group id
   */
  generateId() {
    return 'components/' + this.groupRef + '/' + this.ref;
  }
  /**
   * Generates versions array.
   *
   * @return {Array}
   */
  generateVersions() {
    const v = this.versions || [];
    return v.map((item) => {
      return {
        name: item,
        id: 'versions/' + this.groupRef + '/' + this.ref + '/' + item
      };
    });
  }
}
module.exports.ComponentObject = ComponentObject;
