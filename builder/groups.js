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
          dependencies: json.dependencies,
          description: json.description,
          version: json.version
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
      group.elements = this.mapDependencies(group.dependencies);
      delete group.dependencies;
      return group;
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
        elements: main,
        github: this._computeGithubUrl(bower.repository),
        homepage: bower.homepage
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

  _computeGithubUrl(repository) {
    if (!repository) {
      return;
    }
    var url = repository.url;
    if (!url) {
      return;
    }
    if (url.indexOf('git:') === 0) {
      url = url.replace('git:', 'https:');
    }
    if (url.indexOf('git@github.com:') === 0) {
      url = url.replace('git@github.com:', 'https://github.com/');
    }
    var lastIndex = url.lastIndexOf('.git');
    if (lastIndex > 0 && lastIndex === url.length - 4) {
      url = url.substr(0, lastIndex);
    }
    return url;
  }

}
module.exports.GroupsAnalyser = GroupsAnalyser;
