'use strict';

const {
  Analyzer,
  FSUrlLoader
} = require('polymer-analyzer');
const path = require('path');
const colors = require('colors/safe');
const bowerPath = path.resolve('elements-data/bower_components/');

let analyzer = new Analyzer({
  urlLoader: new FSUrlLoader(bowerPath)
});

const instanceMethods = [
  'created', 'ready', 'attached', 'detached', 'attributeChanged'
];

class Analysis {
  constructor(packages) {
    this.packages = Array.from(packages);
    this.models = [];
  }

  createModels() {
    var info = this.packages.shift();
    if (!info) {
      this._updateBehaviorsRefs();
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

  _concatModels(info) {
    var current = this.models;
    var unique = info.elements.filter(model => {
      return !this._nameFilter(model.tagName, current);
    });
    this.models = this.models.concat(unique);
    unique = info.behaviors.filter(model => {
      return !this._behaviorNameFilter(model.name, current);
    });
    this.models = this.models.concat(unique);
  }

  _nameFilter(name, models) {
    return models.some(model => model.tagName === name);
  }

  _behaviorNameFilter(name, models) {
    return models.some(model => model.name === name);
  }

  _getElementsInfo(group, analysis) {
    this._printAnalyserWarnings(analysis.getWarnings());
    const elements = analysis.getFeatures({
      kind: 'element',
      externalPackages: true
    });
    const behaviors = analysis.getFeatures({
      kind: 'behavior',
      externalPackages: true
    });
    var it = elements.entries();
    var analysedElements = [];
    var analysedBehaviors = [];
    while (true) {
      let next = it.next();
      if (!next.value) {
        break;
      }
      let data = this._analyseElement(group, next.value);
      if (data) {
        analysedElements.push(data);
      }
    }
    it = behaviors.entries();
    while (true) {
      let next = it.next();
      if (!next.value) {
        return Promise.resolve({
          elements: analysedElements,
          behaviors: analysedBehaviors
        });
      }
      let data = this._analyseBehavior(group, next.value);
      if (data) {
        analysedBehaviors.push(data);
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
      isElement: true,
      description: element.description,
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

  _analyseBehavior(group, analysisResult) {
    var element = analysisResult[0];
    var result = {
      isBehavior: true,
      name: element.name,
      description: element.description,
      properties: this.elementProperties(element),
      methods: this.elementMethods(element),
      events: this.elementEvents(element),
      behaviors: this.elementBehaviors(element),
      demos: this.elementDemos(element),
      fileLocation: this.elementLocation(element),
      package: this.elementPackage(element),
      group: group,
      ref: this.createBehaviorRef(element)
    };
    return result;
  }

  createRef(analysisResult) {
    var ref = [analysisResult.package, analysisResult.tagName].join('/');
    return ref;
  }

  createBehaviorRef(elements) {
    var location = elements.sourceRange.file;
    location = location.replace('.html', '');
    return location;
  }

  elementName(analysis) {
    var result = {
      tagName: analysis.tagName,
      name: analysis.name || analysis.tagName
    };
    return result;
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
      if (instanceMethods.indexOf(value.name) !== -1) {
        return;
      }
      result.push(this._extractMethod(value));
    });
    return result;
  }

  _extractMethod(value) {
    var result = {
      name: value.name,
      inheritedFrom: value.inheritedFrom,
      description: value.description,
      params: value.params,
      return: value.return,
      type: value.type,
      privacy: value.privacy
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
    var result = {
      name: value.name,
      inheritedFrom: value.inheritedFrom,
      description: value.description,
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
  /**
   * Updates refs to the behaviors found in elements.
   * Before calling this method each element has a `bahaviors` array with
   * list of strings. This will be replaces to list of objects with `name`
   * and `ref` keys.
   */
  _updateBehaviorsRefs() {
    this.models = this.models.map(model => {
      if (!model.behaviors.length) {
        return model;
      }
      for (let i = 0, len = model.behaviors.length; i < len; i++) {
        let name = model.behaviors[i];
        let behavior = this._findBehavior(name);
        model.behaviors[i] = {
          name: name,
          ref: behavior ? behavior.ref : undefined
        };
      }
      return model;
    });
  }

  _findBehavior(name) {
    return this.models.find(item => item.isBehavior && item.name === name);
  }
}

module.exports.Analysis = Analysis;
