/**
 * Class to be serialized to transport query results.
 */
class ListResponse {
  /**
   * @constructor
   *
   * @param {String} cursor Datastore cursor
   */
  constructor(cursor) {
    this.items = [];
    this.nextPageToken = cursor;
  }
  /**
   * Adds item to the response.
   *
   * @param {Object} item Data model.
   */
  add(item) {
    this.items.push(item);
  }
}
module.exports.ListResponse = ListResponse;
