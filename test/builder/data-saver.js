'use strict';
const fs = require('fs-extra');

class DataSaver {

  writeElementsInfo(models) {
    var promises = models.map(model => {
      const filename = 'data/' + model.ref + '.json';
      return fs.outputJson(filename, model);
    });
    return Promise.all(promises);
  }

  writeGroupsInfo(model) {
    const filename = 'data/groups.json';
    return fs.outputJson(filename, model);
  }

  writePackagesInfo(packages) {
    var promises = packages.map(model => {
      const filename = 'data/' + model.name + '.json';
      return fs.outputJson(filename, model);
    });
    return Promise.all(promises);
  }
}
module.exports.DataSaver = DataSaver;
