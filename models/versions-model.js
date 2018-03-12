const {BaseModel} = require('./base-model');
const {VersionObject} = require('./version-object');
const {ListResponse} = require('./list-response');
const NUM_RESULTS_PER_PAGE = 25;
/**
 * Class to represent Version model
 */
class VersionsModel extends BaseModel {
  /**
   * Returns component model data.
   *
   * @param {String} group Group name (or slug)
   * @param {String} component Component name (or slug)
   * @param {String} version Component version
   * @return {Promise}
   */
  get(group, component, version) {
    const key = this.versionKey(group, component, version);
    return this.store.get(key)
    .then((data) => {
      const entity = data[0];
      if (!entity) {
        return;
      }
      const key = entity[this.store.KEY];
      return new VersionObject(entity, key);
    });
  }
  /**
   * Lists all versions
   * @param {?Object} opts
   * @return {Promise}
   */
  listAll(opts) {
    if (!opts) {
      opts = {};
    }
    const query = this.store.createQuery(this.namespace, this.componentsKind);
    if (opts.cursor) {
      query.start(opts.cursor);
    }
    query.limit(opts.itemsCount || NUM_RESULTS_PER_PAGE);
    return this.store.runQuery(query)
    .then((data) => {
      const entities = data[0];
      const resp = new ListResponse();
      entities.forEach((entity) => {
        const key = entity[this.store.KEY];
        const obj = new VersionObject(entity, key);
        resp.add(obj);
      });
      return resp;
    });
  }
}
module.exports.VersionsModel = VersionsModel;
