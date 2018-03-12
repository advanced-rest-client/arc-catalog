const {BaseModel} = require('./base-model');
const {GroupObject} = require('./group-object');
const {ListResponse} = require('./list-response');
/**
 * Class to represent Groups model
 */
class ComponentsGroupsModel extends BaseModel {
  /**
   * Lists all groups.
   *
   * @return {Promise} Resolved to list of `GroupObject` objects
   */
  list() {
    const query = this.store.createQuery(this.namespace, this.groupsKind);
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
        const obj = new GroupObject(entity, key);
        resp.add(obj);
      });
      return resp;
    });
  }
}
module.exports.ComponentsGroupsModel = ComponentsGroupsModel;
