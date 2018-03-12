const logging = require('../lib/logging');
const slug = require('slug');
const decamelize = require('decamelize');
/**
 * Class to represent Component model
 */
class VersionObject {
  /**
   * @constructor
   *
   * @param {Object} data Restored from the data store model.
   * @param {Object} key Datastore key.
   */
  constructor(data, key) {
    this.name = data.name;
    this.version = data.version;
    this.docs = data.docs;
    this.key = key;
  }
  /**
   * Generates id of the group.
   *
   * @return {String} Group id
   */
  generateId() {
    let id = 'versions/';
    id += slug(decamelize(this.key.path[1], '-')) + '/';
    id += slug(decamelize(this.key.path[3], '-')) + '/';
    id += this.version;
    return id;
  }
  /**
   * Prepares data for serialization.
   *
   * @return {Object} Data to be serialized
   */
  toJSON() {
    const result = {
      name: this.name,
      version: this.version,
      id: this.generateId()
    };
    try {
      result.docs = JSON.parse(this.docs);
    } catch (e) {
      logging.error(e);
      result.docs = {};
    }
    return result;
  }
}
module.exports.VersionObject = VersionObject;
