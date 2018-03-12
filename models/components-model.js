const {BaseModel} = require('./base-model');
const {ComponentObject} = require('./component-object');
const {ListResponse} = require('./list-response');
const NUM_RESULTS_PER_PAGE = 25;
/**
 * Class to represent Groups model
 */
class ComponentsModel extends BaseModel {
  /**
   * Lists all components in the group.
   *
   * @param {String} group Group name (or slug)
   * @param {?Object} opts query options:
   * - cursor - next page cusros
   * - itemsCount - result page size
   * @return {Promise} Resolved to list of `GroupObject` objects
   */
  list(group, opts) {
    if (!opts) {
      opts = {};
    }
    const key = this.groupKey(group);
    const query = this.store.createQuery(this.namespace, this.componentsKind)
    .hasAncestor(key);
    if (opts.cursor) {
      query.start(opts.cursor);
    }
    query.limit(opts.itemsCount || NUM_RESULTS_PER_PAGE);
    return this.store.runQuery(query)
    .then((data) => {
      const entities = data[0];
      const meta = data[1];
      let cursor;
      if (meta.moreResults !== this.store.NO_MORE_RESULTS) {
        cursor = meta.endCursor;
      }
      const resp = new ListResponse(cursor);
      entities.forEach((entity) => {
        const key = entity[this.store.KEY];
        const obj = new ComponentObject(entity, key);
        resp.add(obj);
      });
      return resp;
    });
  }
  /**
   * Returns component model data.
   *
   * @param {String} group Group name (or slug)
   * @param {String} component Component name (or slug)
   * @return {Promise}
   */
  get(group, component) {
    const key = this.componentKey(group, component);
    return this.store.get(key)
    .then((data) => {
      const entity = data[0];
      if (!entity) {
        return;
      }
      const key = entity[this.store.KEY];
      return new ComponentObject(entity, key);
    });
  }
}
module.exports.ComponentsModel = ComponentsModel;
