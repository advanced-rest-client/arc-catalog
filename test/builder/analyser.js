'use strict';

const {Analyzer, FSUrlLoader} = require('polymer-analyzer');
const path = require('path');
const colors = require('colors/safe');
const bowerPath = path.resolve('bower_components/');

let analyzer = new Analyzer({
  urlLoader: new FSUrlLoader(bowerPath)
});

class Analysis {
  constructor(packages) {
    this.packages = Array.from(packages);
    this.models = [];
  }

  createModels() {
    var info = this.packages.shift();
    if (!info) {
      return Promise.resolve(this.models);
    }
    return this._runAnalysis(info);
  }

  _runAnalysis(info) {
    return analyzer.analyze(info.urls).then((analysis) => {
      return this._getElementsInfo(info.name, analysis);
    })
    .then(model => {
      this._concatModels(model);
      return this.createModels();
    });
  }

  _concatModels(elements) {
    var current = this.models;
    var unique = elements.filter(model => {
      return !this._nameFilter(model.tagName, current);
    });
    this.models = this.models.concat(unique);
  }

  _nameFilter(name, models) {
    return models.some(model => model.tagName === name);
  }

  _getElementsInfo(group, analysis) {
    this._printAnalyserWarnings(analysis.getWarnings());
    const elements = analysis.getFeatures({kind: 'element', externalPackages: true});
    var it = elements.entries();
    var analysed = [];
    while (true) {
      let next = it.next();
      if (!next.value) {
        return Promise.resolve(analysed);
      }
      var data = this._analyseElement(group, next.value);
      if (data) {
        analysed.push(data);
      }
    }
  }

  _printAnalyserWarnings(warnings) {
    warnings.forEach(info => {
      console.log('  ', colors.bgYellow('Warning: '), colors.red(info.code),
        colors.yellow(info.message));
      console.log('    at: ' + info.sourceRange.file + ':' +
        info.sourceRange.start.line + ':' + info.sourceRange.start.column);
    });
  }

  _analyseElement(group, analysisResult) {
    var element = analysisResult[0];
    var result = {
      name: this.elementName(element),
      hero: this.elementHero(element),
      description: this.elementDescription(element),
      properties: this.elementProperties(element),
      methods: this.elementMethods(element),
      events: this.elementEvents(element),
      behaviors: this.elementBehaviors(element),
      demos: this.elementDemos(element),
      fileLocation: this.elementLocation(element),
      package: this.elementPackage(element),
      group: group
    };
    Object.assign(result, this.elementName(element));
    result.ref = this.createRef(result);
    return result;
  }

  createRef(analysisResult) {
    var ref = [analysisResult.package, analysisResult.tagName].join('/');
    return ref;
  }

  elementName(analysis) {
    var result = {
      tagName: analysis.tagName,
      name: analysis.name || analysis.tagName
    };
    return result;
  }

  elementHero(analysis) {
    var tags = analysis.jsdoc.tags;
    if (!tags || !tags.length) {
      return;
    }
    var tag = tags.find(_tag => _tag.title === 'hero');
    if (!tag) {
      return;
    }
    return tag.description;
  }

  elementDescription(analysis) {
    return analysis.description;
  }

  elementProperties(analysis) {
    var props = analysis.properties;
    var result = [];
    props.forEach((value) => {
      if (value.isConfiguration) {
        return;
      }
      result.push(this._extractProperty(value));
    });
    return result;
  }

  _extractProperty(meta) {
    var result = {
      name: meta.name,
      description: meta.description,
      default: meta.default,
      inheritedFrom: meta.inheritedFrom,
      type: meta.type,
      readOnly: meta.readOnly,
      published: meta.published,
      notify: meta.notify,
      privacy: meta.privacy,
      reflectToAttribute: meta.reflectToAttribute
    };
    if (meta.inheritedFrom && meta.sourceRange) {
      result.sourceLocation = meta.sourceRange.file;
    }
    return result;
  }

  elementMethods(analysis) {
    var methods = analysis.methods;
    var result = [];
    methods.forEach((value) => {
      result.push(this._extractMethod(value));
    });
    return result;
  }

  _extractMethod(value) {
    var jsdoc = value.jsdoc;
    var result = {
      name: value.name,
      inheritedFrom: value.inheritedFrom,
      description: jsdoc ? jsdoc.description : value.description,
      args: jsdoc ? jsdoc.tags : [],
      return: value.return,
      type: value.type
    };
    if (value.inheritedFrom && value.sourceRange) {
      result.sourceLocation = value.sourceRange.file;
    }
    return result;
  }

  elementEvents(analysis) {
    var methods = analysis.events;
    var result = [];
    methods.forEach((value) => {
      result.push(this._extractEvent(value));
    });
    return result;
  }

  _extractEvent(value) {
    var jsdoc = value.jsdoc;
    var result = {
      name: value.name,
      inheritedFrom: value.inheritedFrom,
      description: jsdoc ? jsdoc.description : value.description,
      params: value.params
    };
    if (value.inheritedFrom && value.sourceRange) {
      result.sourceLocation = value.sourceRange.file;
    }
    return result;
  }

  elementBehaviors(analysis) {
    var behaviors = analysis.behaviorAssignments;
    var result = [];
    if (!behaviors || !behaviors.length) {
      return result;
    }
    result = behaviors.map(item => item.name);
    return result;
  }

  elementDemos(analysis) {
    var demos = analysis.demos;
    var result = [];
    if (!demos || !demos.length) {
      return result;
    }
    result = demos;
    return result;
  }

  elementLocation(analysis) {
    var location = analysis.sourceRange.file;
    return location;
  }

  elementPackage(analysis) {
    var location = analysis.sourceRange.file;
    var parts = location.split('/');
    return parts[0];
  }
}

module.exports.Analysis = Analysis;
