/**
 * Class to represent Groups model
 */
class GroupObject {
  /**
   * @constructor
   *
   * @param {Object} data Restored from the data store model.
   * @param {Object} key Datastore key.
   */
  constructor(data, key) {
    this.__data = data;
    this.name = data.name;
    this.ref = data.ref;
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
      id: this.generateId()
    };
  }
  /**
   * Generates id of the group.
   *
   * @return {String} Group id
   */
  generateId() {
    return 'components/' + this.ref;
  }
}
module.exports.GroupObject = GroupObject;
