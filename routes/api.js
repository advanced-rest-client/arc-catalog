const express = require('express');
const {BaseRoute} = require('./base-route');
const {ComponentsGroupsModel} = require('../models/groups-model');
const {ComponentsModel} = require('../models/components-model');
const {VersionsModel} = require('../models/versions-model');
const {TestGenerator} = require('../models/test-generator');
const router = express.Router();
const logging = require('../lib/logging');
/**
 * Routing for application API.
 */
class ApiRoute extends BaseRoute {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.initRoute();
  }
  /**
   * Initializes routing for `/build` route.
   */
  initRoute() {
    router.options('/(.*)', this._onGetOptions);
    router.get('/groups', this._getGroups.bind(this));
    router.get('/groups/generate', this._getGroupsGenerate.bind(this));
    router.get('/components/:groupId', this._getComponents.bind(this));
    router.get('/components/:groupId/:componentId',
      this._getComponent.bind(this));
    router.get('/versions', this._listAllVersions.bind(this));
    router.get('/versions/:groupId/:componentId/:version',
      this._getVersion.bind(this));
  }
  /**
   * Handler for groups list route
   *
   * @param {Object} req
   * @param {Object} res
   */
  _getGroups(req, res) {
    if (!this._groupsModel) {
      this._groupsModel = new ComponentsGroupsModel();
    }
    this._groupsModel.list()
    .then((result) => {
      this.sendObject(res, result);
    });
  }
  /**
   * Generates random data
   *
   * @param {Object} req
   * @param {Object} res
   */
  _getGroupsGenerate(req, res) {
    if (process.env.NODE_ENV === 'production') {
      this.sendError(res, 400, 400, 'Not allowed in production.');
      return;
    }
    const model = new TestGenerator();
    model.generateTestData()
    .then(() => {
      res.sendStatus(204);
    });
  }
  /**
   * Handler for components list route.
   *
   * @param {Object} req
   * @param {Object} res
   */
  _getComponents(req, res) {
    const group = req.params.groupId;
    const opts = {};
    if (req.query.nextPageToken) {
      opts.cursor = req.query.nextPageToken;
    }
    if (req.query.itemsCount) {
      let cnt = Number(req.query.itemsCount);
      if (cnt === cnt) {
        opts.itemsCount = cnt;
      }
    }
    if (!this._componentsModel) {
      this._componentsModel = new ComponentsModel();
    }
    this._componentsModel.list(group, opts)
    .then((result) => this.sendObject(res, result))
    .catch((cause) => this.sendError(res, 400, 400, cause.message));
  }
  /**
   * Handler for component info route.
   *
   * @param {Object} req
   * @param {Object} res
   */
  _getComponent(req, res) {
    const group = req.params.groupId;
    const component = req.params.componentId;
    if (!this._componentsModel) {
      this._componentsModel = new ComponentsModel();
    }
    this._componentsModel.get(group, component)
    .then((result) => {
      if (result) {
        this.sendObject(res, result);
      } else {
        this.sendError(res, 404, 404, 'Not found');
      }
    })
    .catch((cause) => {
      logging.error(cause);
      this.sendError(res, 500, 500, 'Query error');
    });
  }
  /**
   * Handler for component version info route.
   *
   * @param {Object} req
   * @param {Object} res
   */
  _getVersion(req, res) {
    const group = req.params.groupId;
    const component = req.params.componentId;
    const version = req.params.version;
    if (!this._versionsModel) {
      this._versionsModel = new VersionsModel();
    }
    this._versionsModel.get(group, component, version)
    .then((result) => {
      if (result) {
        this.sendObject(res, result);
      } else {
        this.sendError(res, 404, 404, 'Not found');
      }
    })
    .catch((cause) => {
      logging.error(cause);
      this.sendError(res, 500, 500, 'Query error');
    });
  }
  /**
   * Handler for component version info route.
   *
   * @param {Object} req
   * @param {Object} res
   */
  _listAllVersions(req, res) {
    const opts = {};
    if (req.query.nextPageToken) {
      opts.cursor = req.query.nextPageToken;
    }
    if (req.query.itemsCount) {
      let cnt = Number(req.query.itemsCount);
      if (cnt === cnt) {
        opts.itemsCount = cnt;
      }
    }
    if (!this._versionsModel) {
      this._versionsModel = new VersionsModel();
    }
    this._versionsModel.listAll(opts)
    .then((result) => this.sendObject(res, result))
    .catch((cause) => this.sendError(res, 400, 400, cause.message));
  }
}
new ApiRoute();

module.exports = router;
