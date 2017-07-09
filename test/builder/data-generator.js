'use strict';

const {CatalogBuilder} = require('./builder');

const builder = new CatalogBuilder();
builder.run()
.then(() => {
  process.exit(0);
})
.catch((cause) => {
  console.error(cause);
  process.exit(1);
});
