'use strict';
const fs = require('fs-extra');
const path = require('path');
const {Analysis} = require('./analyser');
const {DataSaver} = require('./data-saver');
const {GroupsAnalyser} = require('./groups');

class CatalogBuilder {

  constructor() {
    this.elements = [];
    this.saver = new DataSaver();
  }

  run() {
    return fs.remove('data')
    .then(() => this.collectPackageInfo())
    .then(info => {
      this.packages = info.packages;
      return this.getGroupsLists();
    })
    .then(info => {
      this.groupsInfo = info.groups;
      this.bundlesInfo = info.elements;
    })
    .then(() => this.analysePackages())
    .then(info => {
      this.elements = info;
      return this.saver.writeElementsInfo(info);
    })
    .then(() => this.saveGroupsInfo())
    .then(() => this.savePackagesInfo())
    .then(() => this.saveBundlesInfo())
    .then(() => console.log('Data models saved.'));
  }

  collectPackageInfo() {
    return fs.readJson('./catalog.json');
  }

  analysePackages() {
    const packages = this.groupsInfo.map(item => {
      let urls = [];
      for (var i = 0, len = item.elements.length; i < len; i++) {
        urls.push(item.elements[i].ref + '.html');
      }
      return {
        urls: urls,
        name: item.name
      };
    });
    const analysis = new Analysis(packages);
    return analysis.createModels();
  }

  getGroupsLists() {
    const packages = this.packages.map(item => {
      return {
        url: path.join('elements-data', 'bower_components', item.name, 'bower.json'),
        name: item.name
      };
    });
    const groups = new GroupsAnalyser(packages);
    return groups.read();
  }

  saveGroupsInfo() {
    const packages = this.packages.map(item => {
      return Object.assign({}, item, {
        ref: item.name
      });
    });
    return this.saver.writeGroupsInfo(packages);
  }

  savePackagesInfo() {
    this.groupsInfo.forEach(group => {
      group.elements = this._processPackageElements(group.elements);
    });
    return this.saver.writePackagesInfo(this.groupsInfo);
  }

  _processPackageElements(elements) {
    var keys = [];
    var result = [];
    elements.forEach(info => {
      if (keys.indexOf(info.name) !== -1) {
        return;
      }
      keys.push(info.name);
      result.push({
        name: info.name,
        tagline: info.tagline,
        version: info.version,
        ref: info.ref // will open first element in bower.json main entry.
      });
    });
    result.sort(this._sortElements);
    return result;
  }

  _sortElements(a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  }
  /**
   * Saves information about each element bundle about number of files
   * included into the bundle so navigation through an element will be
   * possible
   *
   * @return {Promise}
   */
  saveBundlesInfo() {
    var info = this.bundlesInfo;
    return this.saver.writeBundlesInfo(info);
  }
}
module.exports.CatalogBuilder = CatalogBuilder;
