const {BaseModel} = require('./base-model');
const Chance = require('chance');
/**
 * Class to represent Groups model
 */
class TestGenerator extends BaseModel {
  /**
   * Generates tests data.
   * This should be called only when datastore emulator is enabled and setup.
   * Otherwise it will generate data for production.
   *
   * @return {Promise}
   */
  generateTestData() {
    this.chance = new Chance();
    this._entities = [];
    this.generateGroups();
    this.generateComponents();
    this.generateVersions();
    return this.storeGenerated();
  }
  /**
   * Generates groups data.
   */
  generateGroups() {
    const groups = [];
    for (let i = 0; i < 5; i++) {
      let name = this.chance.word();
      let key = this.groupKey(name);
      const data = {
        key: key,
        data: {
          name: name,
          ref: this.slug(name)
        }
      };
      groups.push(data);
      this._entities.push(data);
    }
    this.groups = groups;
  }

  /**
   * Generates components.
   */
  generateComponents() {
    let components = [];
    this.groups.forEach((group) => {
      const items = this._generateComponents(group);
      components = components.concat(items);
      this._entities = this._entities.concat(items);
    });
    this.components = components;
  }

  /**
   * Generates components.
   */
  generateVersions() {
    this.components.forEach((cpm) => {
      const items = this._generateVersions(cpm);
      this._entities = this._entities.concat(items);
    });
  }
  /**
   * Stores generated data to the datastore.
   *
   * @return {Promise}
   */
  storeGenerated() {
    return this.store.upsert(this._entities)
    .then(() => {
      this._entities = undefined;
      this.components = undefined;
      this.groups = undefined;
    });
  }
  /**
   * Generates random components
   *
   * @param {Object} group Group definition
   * @return {Array} Random components.
   */
  _generateComponents(group) {
    const result = [];
    for (let i = 0; i < this.chance.integer({min: 10, max: 50}); i++) {
      result.push(this._generateComponent(group.data.name));
    }
    return result;
  }

  /**
   * Generates random components
   *
   * @param {String} groupName Group name
   * @return {Array} Random components.
   */
  _generateComponent(groupName) {
    const pool = 'abcdefghijklmnopqrstuvwxyz';
    const name = this.chance.string({pool: pool, length: 5}) + '-' +
      this.chance.string({pool: pool, length: 5});
    const key = this.componentKey(groupName, name);
    const entity = {
      key: key,
      data: [{
        name: 'ref',
        value: this.slug(name),
        excludeFromIndexes: false
      }, {
        name: 'name',
        value: name,
        excludeFromIndexes: false
      }, {
        name: 'version',
        value: '1.0.0',
        excludeFromIndexes: true
      }, {
        name: 'versions',
        value: ['1.0.0'],
        excludeFromIndexes: true
      }, {
        name: 'group',
        value: groupName,
        excludeFromIndexes: true
      }]
    };
    return entity;
  }
  /**
   * Generates random versions of the component
   *
   * @param {Object} cmp Component definition
   * @return {Array} Random components.
   */
  _generateVersions(cmp) {
    const result = [];
    this._lastVersion = 1;
    for (let i = 0; i < this.chance.integer({min: 2, max: 10}); i++) {
      const item = this._generateVersion(cmp.data[4].value, cmp.data[1].value);
      cmp.data[3].value.push(item.data[1].value);
      result.push(item);
    }
    return result;
  }
  /**
   * Generates random components
   *
   * @param {String} groupName Group name
   * @param {String} componentName
   * @return {Array} Random version.
   */
  _generateVersion(groupName, componentName) {
    const version = '1.0.' + (this._lastVersion++);
    const key = this.versionKey(groupName, componentName, version);
    const entity = {
      key: key,
      data: [{
        name: 'name',
        value: componentName,
        excludeFromIndexes: false
      }, {
        name: 'version',
        value: version,
        excludeFromIndexes: false
      }, {
        name: 'docs',
        value: '{"schema_version":"1.0.0","elements":[{"description":"`<xml-viewer>` An XML payload viewer for the XML response\n\n### Example\n```\n<xml-viewer xml=\"&lt;tag&gt;&lt;/tag&gt;\"></xml-viewer>\n```\n\n**Note** This element uses web workers with dependencies. It expect to find\nworkers files in current directory in the `workers` folder.\nYour build process has to ensure that this files are avaiable.\n\n## Content actions\n\nYou can add action items in the actions bar by adding elements as a children\nof this element with slot set to `content-action`.\n\n### Example\n```\n<xml-viewer>\n <paper-icon-button title=\"Additional action\" icon=\"arc:cached\" slot=\"content-action\"></paper-icon-button>\n <paper-icon-button title=\"Clear the code\" icon=\"arc:clear\" slot=\"content-action\"></paper-icon-button>\n</xml-viewer>\n```\n\n## Changes in version 2\n\n- The element doesn\'t mixin text search behavior. This service is deprecated.\n- It uses worker files instead of compiled worker data in elements body\n\n### Styling\n\n`<xml-viewer>` provides the following custom properties and mixins for styling:\n\nCustom property | Description | Default\n----------------|-------------|----------\n`--xml-viewer` | Mixin applied to the element | `{}`\n`--xml-viewer-comment-color` | Color of the comment section. | `#236E25`\n`--xml-viewer-punctuation-color` | Color of the punctuation signs | `black`\n`--xml-viewer-tag-name-color` | Color of the XML tag name | `#881280`\n`--xml-viewer-attribute-name-color` | Color of the XML attribute. | `#994500`\n`--xml-viewer-attribute-value-color` | Color of the attribute\'s value. | `#1A1AA6`\n`--xml-viewer-cdata-color` | CDATA section color. | `#48A`\n`--xml-viewer-document-declaration-color` | XML document declaration (header) color. | `#999`\n`--xml-viewer-constant-color` | Constant (boolean, null, number) color. | `#283593`","summary":"","path":"xml-viewer.html","properties":[{"name":"xml","type":"Object","description":"XML data to parse and display","privacy":"public","metadata":{"polymer":{"observer":"\"_changed\""}}},{"name":"isError","type":"boolean","description":"True if error ocurred when parsing data","privacy":"public","metadata":{"polymer":{"notify":true,"readOnly":true}},"defaultValue":"false"},{"name":"working","type":"boolean","description":"True when XML is parsing","privacy":"public","metadata":{"polymer":{"notify":true,"readOnly":true}},"defaultValue":"false"},{"name":"showOutput","type":"boolean","description":"True when output should be shown.","privacy":"public","metadata":{"polymer":{"readOnly":true}},"defaultValue":"false"},{"name":"errorMessage","type":"string","description":"An error message to display.","privacy":"public","metadata":{"polymer":{"readOnly":true}}},{"name":"_worker","type":"Object","description":"A reference to the web worker object.","privacy":"protected","metadata":{"polymer":{}}}],"methods":[{"name":"disconnectedCallback","description":"","privacy":"public","metadata":{},"params":[]},{"name":"_changed","description":"Handler for the xml attribute change.","privacy":"protected","metadata":{},"params":[{"name":"xml","type":"String","description":"Changed value."}]},{"name":"reset","description":"Resets the state of the component.","privacy":"public","metadata":{},"params":[]},{"name":"render","description":"Parses and renders XML data.","privacy":"public","metadata":{},"params":[{"name":"xml","type":"String","description":"XML string to parse and render."}]},{"name":"_ensureWorker","description":"Creates a worker and references it as `_worker` property.","privacy":"protected","metadata":{},"params":[]},{"name":"_workerData","description":"Handler for worker `message` event.\nRenders output","privacy":"protected","metadata":{},"params":[{"name":"e","type":"Event"}]},{"name":"_workerError","description":"Handles error events from the web worker.","privacy":"protected","metadata":{},"params":[{"name":"e","type":"Event"}]},{"name":"_computeShowOutput","description":"Computes value for `showOutput` property","privacy":"protected","metadata":{},"params":[{"name":"working","type":"Boolean"},{"name":"isError","type":"Boolean"},{"name":"xml","type":"String"}],"return":{"type":"Boolean","desc":"`true` if the output can be displayed."}},{"name":"_handleDisplayClick","description":"Handles clicks on the rendered items.\nProvides support for expand / collapse functions.","privacy":"protected","metadata":{},"params":[{"name":"e","type":"Event"}]},{"name":"_computeActionsPanelClass","description":"Computes CSS class for the content actions pane.","privacy":"protected","metadata":{},"params":[{"name":"showOutput"}]}],"demos":[{"url":"demo/index.html","description":""}],"metadata":{},"privacy":"public","superclass":"Polymer.Element","name":"UiElements.XmlViewer","styling":{"cssVariables":[],"selectors":[]},"slots":[{"description":"","name":"content-action","range":{"file":"xml-viewer.html","start":{"line":195,"column":6},"end":{"line":195,"column":41}}}],"tagname":"xml-viewer"}]}',
        excludeFromIndexes: true
      }]
    };
    return entity;
  }
}
module.exports.TestGenerator = TestGenerator;
