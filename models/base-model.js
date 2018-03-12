const Datastore = require('@google-cloud/datastore');
const slug = require('slug');
const decamelize = require('decamelize');
const config = require('../config');
/**
 * Base class for ARC components models.
 */
class BaseModel {
  /**
   * @constructor
   */
  constructor() {
    this.store = new Datastore({
      projectId: config.get('GCLOUD_PROJECT')
    });
    this.namespace = 'api-components';
    this.componentsKind = 'Component';
    this.versionsKind = 'Version';
    this.groupsKind = 'Group';
  }
  /**
   * Creates a slug from a string.
   *
   * @param {String} name Value to slug,
   * @return {String}
   */
  slug(name) {
    return slug(decamelize(name, '-'));
  }
  /**
   * Creates a datastore key for a Group entity.
   *
   * @param {String} name Group name
   * @return {Object} Datastore key for groups
   */
  groupKey(name) {
    return this.store.key({
      namespace: this.namespace,
      path: [
        this.groupsKind,
        this.slug(name)
      ]
    });
  }

  /**
   * Creates a datastore key for a Component entity.
   *
   * @param {String} groupName Group name
   * @param {String} componentName Component name
   * @return {Object} Datastore key for component
   */
  componentKey(groupName, componentName) {
    return this.store.key({
      namespace: this.namespace,
      path: [
        this.groupsKind,
        this.slug(groupName),
        this.componentsKind,
        this.slug(componentName)
      ]
    });
  }

  /**
   * Creates a datastore key for a Version entity.
   *
   * @param {String} groupName Group name
   * @param {String} componentName Component name
   * @param {String} version Component version
   * @return {Object} Datastore key for component
   */
  versionKey(groupName, componentName, version) {
    return this.store.key({
      namespace: this.namespace,
      path: [
        this.groupsKind,
        this.slug(groupName),
        this.componentsKind,
        this.slug(componentName),
        this.versionsKind,
        version
      ]
    });
  }
}
module.exports.BaseModel = BaseModel;
