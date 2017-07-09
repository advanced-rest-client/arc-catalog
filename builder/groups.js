'use strict';
const fs = require('fs-extra');
const path = require('path');

class GroupsAnalyser {
  constructor(packages) {
    this.packages = packages;
    this.bowers = {};
  }

  read() {
    var promises = this.packages.map(info => {
      return fs.readJson(info.url).then(json => {
        return {
          name: info.name,
          dependencies: json.dependencies
        };
      });
    });
    var groups;
    return Promise.all(promises)
    .then(info => this.computeGroups(info))
    .then(info => {
      groups = info;
      return this.computeElementsBundles();
    })
    .then(elementsInfo => {
      return {
        groups: groups,
        elements: elementsInfo
      };
    });
  }

  computeGroups(groupInfo) {
    var info = groupInfo.map((group) => {
      let result = {
        name: group.name,
        elements: this.mapDependencies(group.dependencies)
      };
      return result;
    });
    return info;
  }

  computeElementsBundles() {
    return Object.keys(this.bowers).map(elementName => {
      let bower = this.bowers[elementName];
      let main = bower.main;
      if (!(main instanceof Array)) {
        main = [main];
      }
      for (var i = 0, len = main.length; i < len; i++) {
        main[i] = main[i].replace('.html', '');
      }

      return {
        name: bower.name,
        description: bower.description,
        version: bower.version,
        license: bower.license,
        elements: main
      };
    });
  }

  mapDependencies(dependencies) {
    var list = [];
    Object.keys(dependencies).forEach(name => {
      // open bower of the file and read "main" section.
      var bower = this.readBowerForElement(name);
      if (!bower) {
        console.log('Couldn\'t read bower.json for', name);
        return;
      }
      let main = bower.main;
      if (!(main instanceof Array)) {
        main = [main];
      }

      for (var i = 0, len = main.length; i < len; i++) {
        let entry = main[i];
        entry = entry.replace('.html', '');
        list.push({
          name: name,
          ref: name + '/' + entry,
          tagline: bower.description,
          version: bower.version
        });
      }
    });
    return list;
  }

  readBowerForElement(name) {
    if (name in this.bowers) {
      return this.bowers[name];
    }
    var url = path.join('elements-data', 'bower_components', name, 'bower.json');
    var bower;
    try {
      let content = fs.readFileSync(url, 'utf8');
      bower = JSON.parse(content);
    } catch (e) {
      return;
    }
    this.bowers[name] = bower;
    return bower;
  }

}
module.exports.GroupsAnalyser = GroupsAnalyser;
